class ConfigurationsHelper {
  private readonly storageKey = "javaDependencer-disabledConfigurations";
  private disabledConfigurations: string[] | undefined = undefined;

  public isEnabled(configuration: string): boolean {
    return !configuration || !this.getDisabledConfigurations().includes(configuration);
  }

  public getDisabledConfigurations(): string[] {
    if (this.disabledConfigurations) {
      return this.disabledConfigurations;
    }
    const inStorage = localStorage.getItem(this.storageKey);
    if (inStorage) {
      this.disabledConfigurations = JSON.parse(inStorage);
      return this.disabledConfigurations || [];
    }
    this.disabledConfigurations = [];
    return [];
  }

  public enableConfiguration(configuration: string) {
    let confs = this.getDisabledConfigurations();
    confs = confs.filter((c) => c !== configuration);
    this.disabledConfigurations = confs;
    localStorage.setItem(this.storageKey, JSON.stringify(confs));
  }

  public disableConfiguration(configuration: string) {
    const confs = this.getDisabledConfigurations();
    if (!confs.includes(configuration)) {
      confs.push(configuration);
    }
    this.disabledConfigurations = confs;
    localStorage.setItem(this.storageKey, JSON.stringify(confs));
  }
}

export default new ConfigurationsHelper();
