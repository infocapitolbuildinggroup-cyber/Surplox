export const PERMISSION_GROUPS = {
    warehouse_operations: {
      label: 'Warehouse Operations',
      dashboard: true,
      newFMR: true,
      queue: true,
      myRequests: true,
      inventory: true,
      receiving: true,
      fieldDelivery: true,
      returns: true,
      damaged: true,
      plantMap: true,
      messages: true,
      alerts: true
    },
  
    field_operations: {
      label: 'Field Operations',
      dashboard: true,
      newFMR: true,
      myRequests: true,
      plantMap: true,
      messages: true,
      alerts: true
    },
  
    field_leadership: {
      label: 'Field Leadership',
      dashboard: true,
      newFMR: true,
      myRequests: true,
      crewRequests: true,
      deliveryStatus: true,
      plantMap: true,
      messages: true,
      alerts: true
    },
  
    project_controls: {
      label: 'Project Controls',
      dashboard: true,
      queue: true,
      myRequests: true,
      deliveryStatus: true,
      plantMap: true,
      reports: true,
      messages: true,
      alerts: true
    },
  
    supervisor: {
      label: 'Supervisor',
      dashboard: true,
      newFMR: true,
      queue: true,
      myRequests: true,
      inventory: true,
      receiving: true,
      fieldDelivery: true,
      returns: true,
      damaged: true,
      plantMap: true,
      reports: true,
      messages: true,
      alerts: true
    },
  
    admin: {
      label: 'Administrator',
      dashboard: true,
      newFMR: true,
      queue: true,
      myRequests: true,
      inventory: true,
      receiving: true,
      fieldDelivery: true,
      returns: true,
      damaged: true,
      plantMap: true,
      reports: true,
      messages: true,
      alerts: true,
      admin: true
    }
  }
  
  export function getPermissions(permissionGroup) {
    return PERMISSION_GROUPS[permissionGroup] || PERMISSION_GROUPS.field_operations
  }
  
  export function canAccess(permissionGroup, key) {
    const permissions = getPermissions(permissionGroup)
    return Boolean(permissions[key])
  }
  
  export function isWarehouseUser(permissionGroup) {
    return ['warehouse_operations', 'supervisor', 'admin'].includes(permissionGroup)
  }
  
  export function isFieldUser(permissionGroup) {
    return ['field_operations', 'field_leadership'].includes(permissionGroup)
  }