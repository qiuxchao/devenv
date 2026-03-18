use std::fs;
use std::path::PathBuf;

const HOOK_MARKER: &str = "# >>> devenv hook >>>";
const HOOK_MARKER_END: &str = "# <<< devenv hook <<<";

/// ~/.devenv/ directory
fn devenv_dir() -> Option<PathBuf> {
    Some(dirs::home_dir()?.join(".devenv"))
}

/// Active profile script path (platform-specific)
fn active_script_path() -> Option<PathBuf> {
    let dir = devenv_dir()?;
    if cfg!(windows) {
        Some(dir.join("active.ps1"))
    } else {
        Some(dir.join("active.sh"))
    }
}

/// Get shell config path and shell name
fn get_shell_config_path() -> Option<(PathBuf, String)> {
    let home = dirs::home_dir()?;

    if cfg!(windows) {
        // PowerShell profile: ~\Documents\PowerShell\Microsoft.PowerShell_profile.ps1
        // or legacy: ~\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1
        let docs = home.join("Documents");
        let ps_core = docs.join("PowerShell").join("Microsoft.PowerShell_profile.ps1");
        let ps_legacy = docs.join("WindowsPowerShell").join("Microsoft.PowerShell_profile.ps1");

        if ps_core.exists() {
            Some((ps_core, "powershell".to_string()))
        } else if ps_legacy.exists() {
            Some((ps_legacy, "powershell".to_string()))
        } else {
            // Default to PowerShell Core path, create parent dirs later
            Some((ps_core, "powershell".to_string()))
        }
    } else {
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
}

/// Build the hook block to inject into shell config
fn build_hook_block() -> String {
    let active_path = active_script_path()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_default();

    if cfg!(windows) {
        // PowerShell hook
        format!(
            r#"{marker}
if (Test-Path "{path}") {{ . "{path}" }}
{marker_end}"#,
            marker = HOOK_MARKER,
            path = active_path,
            marker_end = HOOK_MARKER_END,
        )
    } else {
        // Bash/Zsh hook
        format!(
            r#"{marker}
[ -f "{path}" ] && source "{path}"
{marker_end}"#,
            marker = HOOK_MARKER,
            path = active_path,
            marker_end = HOOK_MARKER_END,
        )
    }
}

/// Ensure ~/.devenv/ exists and create placeholder active script
fn ensure_devenv_dir() -> Result<(), String> {
    let dir = devenv_dir().ok_or("Cannot detect home directory")?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;

    let active = active_script_path().ok_or("Cannot detect home directory")?;
    if !active.exists() {
        let header = if cfg!(windows) {
            "# DevEnv active profile — managed by DevEnv app\n"
        } else {
            "# DevEnv active profile — managed by DevEnv app\n"
        };
        fs::write(&active, header).map_err(|e| e.to_string())?;
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

    // Ensure parent directory exists (for PowerShell profile)
    if let Some(parent) = config_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

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

/// Write the active profile's env vars to the active script
#[tauri::command]
fn write_active_profile(vars: Vec<serde_json::Value>) -> Result<(), String> {
    ensure_devenv_dir()?;

    let dir = devenv_dir().ok_or("Cannot detect home directory")?;

    // Always write both formats so cross-platform shells (e.g. Git Bash on Windows) work
    let mut sh_content = String::from("# DevEnv active profile — managed by DevEnv app\n");
    sh_content.push_str("# Do not edit manually, changes will be overwritten.\n\n");

    let mut ps_content = String::from("# DevEnv active profile — managed by DevEnv app\n");
    ps_content.push_str("# Do not edit manually, changes will be overwritten.\n\n");

    for var in &vars {
        let enabled = var["enabled"].as_bool().unwrap_or(false);
        let key = var["key"].as_str().unwrap_or("");
        let value = var["value"].as_str().unwrap_or("");

        if !enabled || key.is_empty() {
            continue;
        }

        // Shell format: export KEY='value'
        let sh_escaped = value.replace('\'', "'\\''");
        sh_content.push_str(&format!("export {}='{}'\n", key, sh_escaped));

        // PowerShell format: $env:KEY = "value"
        let ps_escaped = value.replace('"', "`\"");
        ps_content.push_str(&format!("$env:{} = \"{}\"\n", key, ps_escaped));
    }

    fs::write(dir.join("active.sh"), sh_content).map_err(|e| e.to_string())?;
    fs::write(dir.join("active.ps1"), ps_content).map_err(|e| e.to_string())?;

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

/// Clear active profile scripts
#[tauri::command]
fn clear_active_profile() -> Result<(), String> {
    ensure_devenv_dir()?;
    let dir = devenv_dir().ok_or("Cannot detect home directory")?;
    fs::write(dir.join("active.sh"), "# DevEnv — no active profile\n")
        .map_err(|e| e.to_string())?;
    fs::write(dir.join("active.ps1"), "# DevEnv — no active profile\n")
        .map_err(|e| e.to_string())?;
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
