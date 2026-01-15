export const isAdmin = (user) => {
  return user && user.role === 'admin';
};

export const isClient = (user) => {
  return user && user.role === 'client';
};

export const isController = (user) => {
  return user && user.role === 'controller';
};

export const hasRole = (user, role) => {
  return user && user.role === role;
};

export const hasAnyRole = (user, roles) => {
  return user && roles.includes(user.role);
};

export const canAccessResource = (user, resourceOwnerRole, targetRole) => {
  // Admins can access everything
  if (isAdmin(user)) return true;
  
  // Controllers can access client resources
  if (isController(user) && isClient({ role: resourceOwnerRole })) return true;
  
  // Users can access their own resources
  if (user && user.role === resourceOwnerRole) return true;
  
  return false;
};