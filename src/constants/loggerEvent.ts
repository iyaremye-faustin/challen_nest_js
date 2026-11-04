export enum LoggerEvent {
  // Seeders
  SeedersDatabaseSynced = 'seeders.database.synced',
  SeedersOrganisationFailed = 'seeders.organisation.failed',
  SeedersPillarFailed = 'seeders.pillar.failed',
  SeedersPrivilegesFailed = 'seeders.privileges.failed',
  SeedersCompleted = 'seeders.completed',
  SeedersError = 'seeders.error',
  SeedersProcessExit = 'seeders.process.exit',
  SeedersFailed = 'seeders.failed',

  // Auth
  UserLogin = 'user.login',
  UserLoginFailed = 'user.login.failed',

  // Users
  UserCreated = 'user.created',
  UserUpdated = 'user.updated',
  UserDeleted = 'user.deleted',

  // Files
  FileUploaded = 'file.uploaded',
  FileDeleted = 'file.deleted',
  FileUploadFailed = 'file.upload.failed',

  // Email
  EmailSent = 'email.sent',
  EmailFailed = 'email.failed',
}
