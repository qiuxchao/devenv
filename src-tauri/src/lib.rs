use std::fs;
use std::path::PathBuf;

const HOOK_MARKER: &str = "# >>> devenv hook >>>";
const HOOK_MARKER_END: &str = "# <<< devenv hook <<<";

/// ~/.devenv/active.sh — the file that shell sources
fn devenv_dir() -> Option<PathBuf> {
    Some(dirs::home_dir()?.join(".devenv"))
}

fn active_sh_path() -> Option<PathBuf> {
    Some(devenv_dir()?.join("active.sh"))
}

fn get_shell_config_path() -> Option<(PathBuf, String)> {
    let home = dirs::home_dir()?;
    let shell = std::env::var("SHELL").unwrap_or_default();

    if shell.contains("zsh") {
        Some((home.join(".zshrc"), "zsh".to_string()))
    } else if shell.contains("bash") {
        let bashrc = home.join(".bashrc");
        let profile = home.join(".bash_profile");
        if bashrc.exists() {
            Some((bashrc, "bash".to_string()))
        } else {
            Some((profile, "bash".to_string()))
        }
    } else {
        Some((home.join(".zshrc"), "zsh".to_string()))
    }
}

fn build_hook_block() -> String {
    let active_path = active_sh_path()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|| "$HOME/.devenv/active.sh".to_string());

    format!(
        r#"{marker}
[ -f "{path}" ] && source "{path}"
{marker_end}"#,
        marker = HOOK_MARKER,
        path = active_path,
        marker_end = HOOK_MARKER_END,
    )
}

/// Ensure ~/.devenv/ exists and write active.sh
fn ensure_devenv_dir() -> Result<(), String> {
    let dir = devenv_dir().ok_or("Cannot detect home directory")?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;

    let active = dir.join("active.sh");
    if !active.exists() {
        fs::write(&active, "# DevEnv active profile — managed by DevEnv app\n")
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn get_shell_hook_status() -> Result<serde_json::Value, String> {
    let (config_path, shell) = get_shell_config_path()
        .ok_or("Cannot detect home directory")?;

    let installed = if config_path.exists() {
        let content = fs::read_to_string(&config_path).unwrap_or_default();
        content.contains(HOOK_MARKER)
    } else {
        false
    };

    Ok(serde_json::json!({
        "installed": installed,
        "shell": shell,
        "configPath": config_path.to_string_lossy(),
    }))
}

#[tauri::command]
fn install_shell_hook() -> Result<serde_json::Value, String> {
    ensure_devenv_dir()?;

    let (config_path, _shell) = get_shell_config_path()
        .ok_or("Cannot detect home directory")?;

    let content = if config_path.exists() {
        fs::read_to_string(&config_path).map_err(|e| e.to_string())?
    } else {
        String::new()
    };

    if content.contains(HOOK_MARKER) {
        return Ok(serde_json::json!({
            "success": true,
            "alreadyInstalled": true,
            "configPath": config_path.to_string_lossy(),
        }));
    }

    let hook_block = build_hook_block();
    let new_content = if content.is_empty() {
        hook_block
    } else {
        format!("{}\n\n{}\n", content.trim_end(), hook_block)
    };

    fs::write(&config_path, new_content).map_err(|e| e.to_string())?;

    Ok(serde_json::json!({
        "success": true,
        "alreadyInstalled": false,
        "configPath": config_path.to_string_lossy(),
    }))
}

#[tauri::command]
fn uninstall_shell_hook() -> Result<serde_json::Value, String> {
    let (config_path, _shell) = get_shell_config_path()
        .ok_or("Cannot detect home directory")?;

    if !config_path.exists() {
        return Ok(serde_json::json!({ "success": true }));
    }

    let content = fs::read_to_string(&config_path).map_err(|e| e.to_string())?;

    if !content.contains(HOOK_MARKER) {
        return Ok(serde_json::json!({ "success": true }));
    }

    let mut result = String::new();
    let mut in_block = false;
    for line in content.lines() {
        if line.trim() == HOOK_MARKER {
            in_block = true;
            continue;
        }
        if line.trim() == HOOK_MARKER_END {
            in_block = false;
            continue;
        }
        if !in_block {
            result.push_str(line);
            result.push('\n');
        }
    }

    let result = result.trim_end().to_string() + "\n";
    fs::write(&config_path, result).map_err(|e| e.to_string())?;

    Ok(serde_json::json!({ "success": true }))
}

/// Write the active profile's env vars to ~/.devenv/active.sh
#[tauri::command]
fn write_active_profile(vars: Vec<serde_json::Value>) -> Result<(), String> {
    ensure_devenv_dir()?;

    let active = active_sh_path().ok_or("Cannot detect home directory")?;
    let mut content = String::from("# DevEnv active profile — managed by DevEnv app\n");
    content.push_str("# Do not edit manually, changes will be overwritten.\n\n");

    for var in vars {
        let enabled = var["enabled"].as_bool().unwrap_or(false);
        let key = var["key"].as_str().unwrap_or("");
        let value = var["value"].as_str().unwrap_or("");

        if !enabled || key.is_empty() {
            continue;
        }

        // Escape single quotes in value
        let escaped = value.replace('\'', "'\\''");
        content.push_str(&format!("export {}='{}'\n", key, escaped));
    }

    fs::write(&active, content).map_err(|e| e.to_string())?;
    Ok(())
}

/// Get the OS-level system locale
#[tauri::command]
fn get_system_locale() -> String {
    let locale = sys_locale::get_locale().unwrap_or_else(|| "en".to_string());
    if locale.contains("zh") {
        "zh-CN".to_string()
    } else {
        "en".to_string()
    }
}

/// Clear ~/.devenv/active.sh when no profile is active
#[tauri::command]
fn clear_active_profile() -> Result<(), String> {
    ensure_devenv_dir()?;
    let active = active_sh_path().ok_or("Cannot detect home directory")?;
    fs::write(&active, "# DevEnv — no active profile\n").map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_shell_hook_status,
            install_shell_hook,
            uninstall_shell_hook,
            write_active_profile,
            clear_active_profile,
            get_system_locale,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
