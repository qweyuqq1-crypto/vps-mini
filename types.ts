
export interface ForwardRule {
  id: string;
  local_port: number;
  remote_ip: string;
  remote_port: number;
  protocol: string;
  is_enabled: boolean;
  description: string;
  username?: string;
  password?: string;
  expire_date?: string; // ISO 格式日期字符串
}

export interface CodeSnippet {
  filename: string;
  content: string;
  language: string;
}
