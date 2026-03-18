export interface EnvVar {
  key: string;
  value: string;
  enabled: boolean;
}

export interface Profile {
  id: string;
  name: string;
  description: string;
  active: boolean;
  vars: EnvVar[];
}
