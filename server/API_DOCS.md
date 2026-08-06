# API Documentation

## Auth Routes
- **POST** `/api/auth/login`
  - Auth: None
  - Body: `{ email, password }`
  - Response: `{ success, message, data: { token, user: { ... } } }`
- **GET** `/api/auth/me`
  - Auth: Any Role
  - Response: `{ success, message, data: { user details } }`

## User Routes
- **GET** `/api/users/employees/list`
  - Auth: Administrator, Receptionist
  - Response: `{ success, message, data: [ users with role Employee ] }`
- **GET** `/api/users`
  - Auth: Administrator
  - Response: `{ success, message, data: [ all users ] }`
- **POST** `/api/users`
  - Auth: Administrator
  - Body: `{ name, email, password, role, department, phone }`
  - Response: `{ success, message, data: { created user } }`
- **PUT** `/api/users/:id`
  - Auth: Administrator
  - Body: `{ name, email, password, role, department, phone, isActive }`
  - Response: `{ success, message, data: { updated user } }`
- **DELETE** `/api/users/:id`
  - Auth: Administrator
  - Response: `{ success, message, data: null }`

## Visitor Routes
- **POST** `/api/visitors`
  - Auth: Receptionist
  - Body: `{ visitorName, visitorPhone, visitorEmail, employeeToVisit, visitDate, expectedArrivalTime, purposeOfVisit }`
  - Response: `{ success, message, data: { created pass } }`
- **GET** `/api/visitors`
  - Auth: Any Role
  - Query Params: `visitorName, employeeId, date, status, search`
  - Response: `{ success, message, data: [ visitor passes ] }`
- **GET** `/api/visitors/:id`
  - Auth: Any Role
  - Response: `{ success, message, data: { pass, activityLogs } }`
- **PATCH** `/api/visitors/:id/approve`
  - Auth: Employee
  - Body: `{ remarks }`
  - Response: `{ success, message, data: { updated pass } }`
- **PATCH** `/api/visitors/:id/reject`
  - Auth: Employee
  - Body: `{ remarks }`
  - Response: `{ success, message, data: { updated pass } }`
- **POST** `/api/visitors/:id/check-in`
  - Auth: Receptionist
  - Response: `{ success, message, data: { updated pass } }`
- **POST** `/api/visitors/:id/check-out`
  - Auth: Receptionist
  - Response: `{ success, message, data: { updated pass } }`
- **PATCH** `/api/visitors/:id/cancel`
  - Auth: Receptionist, Administrator
  - Response: `{ success, message, data: { updated pass } }`
- **GET** `/api/visitors/:id/logs`
  - Auth: Any Role
  - Response: `{ success, message, data: [ activity logs ] }`

## Dashboard Routes
- **GET** `/api/dashboard/stats`
  - Auth: Any Role
  - Response: `{ success, message, data: { statistics object specific to role } }`

## Report Routes
- **GET** `/api/reports/visitors`
  - Auth: Administrator
  - Query Params: `range` ('today' | 'week' | 'custom'), `startDate`, `endDate`
  - Response: `{ success, message, data: { stats, visitors } }`

## Activity Logs Routes
- **GET** `/api/activity-logs`
  - Auth: Administrator
  - Response: `{ success, message, data: [ all activity logs ] }`
