export class UnmountedError extends Error {
  constructor(message = "") {
    super(message);
    this.name = 'UnmountedError';
    this.message = message;
  }
};

export class DomainVerificationError extends Error {
  constructor(message = "") {
    super(message);
    this.name = 'DomainVerificationError';
    this.message = message;
  }
};
