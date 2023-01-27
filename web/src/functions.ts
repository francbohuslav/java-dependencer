export async function ajax<T>(request: string): Promise<T> {
  const data = await ajaxRaw(request);
  return JSON.parse(data) as T;
}

export async function ajaxRaw(request: string): Promise<string> {
  const serverUrl = import.meta.env.DEV ? "http://localhost:3000/" : "/";
  const data = await fetch(serverUrl + "api/" + request);
  return await data.text();
}

export interface IModuleId {
  appName: string;
  moduleName: string;
}
