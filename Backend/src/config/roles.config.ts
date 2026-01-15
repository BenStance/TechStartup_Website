export enum Role {
  ADMIN = 'admin',
  CONTROLLER = 'controller',
  CLIENT = 'client',
}

export const RolesConfig = {
  hierarchy: {
    [Role.ADMIN]: [Role.CONTROLLER, Role.CLIENT],
    [Role.CONTROLLER]: [Role.CLIENT],
    [Role.CLIENT]: [],
  },
};