const BASE_URL = '/api';

async function request<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const result = await response.json();
    if (result && typeof result === 'object' && 'success' in result) {
      if (!result.success) throw new Error(result.error || 'API请求失败');
      return result.data as T;
    }
    return result as T;
  } catch (error) {
    console.error(`[API] ${options.method || 'GET'} ${url} failed:`, error);
    throw error;
  }
}

async function get<T = any>(url: string): Promise<T> {
  return request<T>(url, { method: 'GET' });
}

async function post<T = any>(url: string, data?: any): Promise<T> {
  return request<T>(url, {
    method: 'POST',
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
}

async function put<T = any>(url: string, data?: any): Promise<T> {
  return request<T>(url, {
    method: 'PUT',
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
}

async function del<T = any>(url: string): Promise<T> {
  return request<T>(url, { method: 'DELETE' });
}

export const api = {
  get,
  post,
  put,
  delete: del,
};

export async function getStations(): Promise<any> {
  return get('/gas-stations');
}

export async function getStation(id: string): Promise<any> {
  return get(`/gas-stations/${id}`);
}

export async function createStation(data: any): Promise<any> {
  return post('/gas-stations', data);
}

export async function updateStation(id: string, data: any): Promise<any> {
  return put(`/gas-stations/${id}`, data);
}

export async function deleteStation(id: string): Promise<any> {
  return del(`/gas-stations/${id}`);
}

export async function getNodes(): Promise<any> {
  return get('/pipeline-nodes');
}

export async function getNode(id: string): Promise<any> {
  return get(`/pipeline-nodes/${id}`);
}

export async function createNode(data: any): Promise<any> {
  return post('/pipeline-nodes', data);
}

export async function updateNode(id: string, data: any): Promise<any> {
  return put(`/pipeline-nodes/${id}`, data);
}

export async function deleteNode(id: string): Promise<any> {
  return del(`/pipeline-nodes/${id}`);
}

export async function updateNodePressure(id: string, pressure: number, status: string): Promise<any> {
  return put(`/pipeline-nodes/${id}/pressure`, { pressure, status });
}

export async function getCustomers(type?: string): Promise<any> {
  const url = type ? `/customers?type=${encodeURIComponent(type)}` : '/customers';
  return get(url);
}

export async function getCustomer(id: string): Promise<any> {
  return get(`/customers/${id}`);
}

export async function createCustomer(data: any): Promise<any> {
  return post('/customers', data);
}

export async function updateCustomer(id: string, data: any): Promise<any> {
  return put(`/customers/${id}`, data);
}

export async function deleteCustomer(id: string): Promise<any> {
  return del(`/customers/${id}`);
}

export async function getDispatchPlans(): Promise<any> {
  return get('/dispatch-plans');
}

export async function getDispatchPlan(id: string): Promise<any> {
  return get(`/dispatch-plans/${id}`);
}

export async function createDispatchPlan(data: any): Promise<any> {
  return post('/dispatch-plans', data);
}

export async function updateDispatchPlan(id: string, data: any): Promise<any> {
  return put(`/dispatch-plans/${id}`, data);
}

export async function updateDispatchPlanStatus(
  id: string,
  status: string,
  reason?: string,
  approver?: string
): Promise<any> {
  return put(`/dispatch-plans/${id}/status`, { status, reason, approver });
}

export async function deleteDispatchPlan(id: string): Promise<any> {
  return del(`/dispatch-plans/${id}`);
}

export async function generateDispatchPlan(params: any): Promise<any> {
  return post('/dispatch-plans/generate', params);
}

export async function getAlarms(): Promise<any> {
  return get('/emergency-alarms');
}

export async function getAlarm(id: string): Promise<any> {
  return get(`/emergency-alarms/${id}`);
}

export async function createAlarm(data: any): Promise<any> {
  return post('/emergency-alarms', data);
}

export async function acknowledgeAlarm(id: string, by: string): Promise<any> {
  return put(`/emergency-alarms/${id}/acknowledge`, { by });
}

export async function resolveAlarm(id: string, by: string, notes?: string): Promise<any> {
  return put(`/emergency-alarms/${id}/resolve`, { by, notes });
}

export async function deleteAlarm(id: string): Promise<any> {
  return del(`/emergency-alarms/${id}`);
}

export async function getRepairOrders(): Promise<any> {
  return get('/repair-orders');
}

export async function getRepairOrder(id: string): Promise<any> {
  return get(`/repair-orders/${id}`);
}

export async function createRepairOrder(data: any): Promise<any> {
  return post('/repair-orders', data);
}

export async function updateRepairOrder(id: string, data: any): Promise<any> {
  return put(`/repair-orders/${id}`, data);
}

export async function updateRepairOrderStatus(
  id: string,
  status: string,
  teamId?: string
): Promise<any> {
  return put(`/repair-orders/${id}/status`, { status, teamId });
}

export async function deleteRepairOrder(id: string): Promise<any> {
  return del(`/repair-orders/${id}`);
}

export async function getRepairTeams(): Promise<any> {
  return get('/repair-teams');
}

export async function getRepairTeam(id: string): Promise<any> {
  return get(`/repair-teams/${id}`);
}

export async function createRepairTeam(data: any): Promise<any> {
  return post('/repair-teams', data);
}

export async function updateRepairTeam(id: string, data: any): Promise<any> {
  return put(`/repair-teams/${id}`, data);
}

export async function deleteRepairTeam(id: string): Promise<any> {
  return del(`/repair-teams/${id}`);
}

export async function getRepairVehicles(): Promise<any> {
  return get('/repair-vehicles');
}

export async function getRepairVehicle(id: string): Promise<any> {
  return get(`/repair-vehicles/${id}`);
}

export async function createRepairVehicle(data: any): Promise<any> {
  return post('/repair-vehicles', data);
}

export async function updateRepairVehicle(id: string, data: any): Promise<any> {
  return put(`/repair-vehicles/${id}`, data);
}

export async function deleteRepairVehicle(id: string): Promise<any> {
  return del(`/repair-vehicles/${id}`);
}

export async function getRepairTickets(): Promise<any> {
  return get('/repair-tickets');
}

export async function getRepairTicket(id: string): Promise<any> {
  return get(`/repair-tickets/${id}`);
}

export async function createRepairTicket(data: any): Promise<any> {
  return post('/repair-tickets', data);
}

export async function dispatchRepairTicket(id: string, workerId: string): Promise<any> {
  return put(`/repair-tickets/${id}/dispatch`, { workerId });
}

export async function completeRepairTicket(id: string, result: string): Promise<any> {
  return put(`/repair-tickets/${id}/complete`, { result });
}

export async function deleteRepairTicket(id: string): Promise<any> {
  return del(`/repair-tickets/${id}`);
}

export async function getWorkers(): Promise<any> {
  return get('/maintenance-workers');
}

export async function getWorker(id: string): Promise<any> {
  return get(`/maintenance-workers/${id}`);
}

export async function createWorker(data: any): Promise<any> {
  return post('/maintenance-workers', data);
}

export async function updateWorker(id: string, data: any): Promise<any> {
  return put(`/maintenance-workers/${id}`, data);
}

export async function deleteWorker(id: string): Promise<any> {
  return del(`/maintenance-workers/${id}`);
}

export async function getStatistics(): Promise<any> {
  return get('/statistics');
}
