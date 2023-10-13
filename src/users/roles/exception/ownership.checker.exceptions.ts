export class BaseException extends Error {
  private readonly response;

  constructor(response: string | Record<string, any>) {
    super();
    this.response = response;
    this.extractMessage();
    this.extractName();
  }

  private extractMessage() {
    if (typeof this.response === 'string') this.message = this.response;
    else if (typeof this.response == 'object')
      this.message = this.response.message;
  }

  private extractName() {
    this.name = this.constructor.name;
  }

  public getDescription(): string | object {
    return this.response;
  }
}

export class NoOwnershipCheckerException extends BaseException {
  constructor(message = 'Resource Ownership Checker not found.') {
    super({ type: 'NoOwnershipCheckerException', message });
  }
}
export class NoResourceToCheckException extends BaseException {
  constructor(message = 'No resource to check.') {
    super({ type: 'NoResourceToCheckException', message });
  }
}
