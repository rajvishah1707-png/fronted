import { adminFetch } from './adminApi';
beforeEach(()=>{localStorage.clear();global.fetch=jest.fn().mockResolvedValue({status:200});});
test('existing admin API calls receive the actual admin JWT',async()=>{
    localStorage.setItem('adminToken','real-admin-token');
    await adminFetch('https://backend-1df5.onrender.com/api/admin/users',{headers:{'Content-Type':'application/json',Authorization:'Bearer incorrect'}});
    expect(fetch).toHaveBeenCalledTimes(1);expect(fetch.mock.calls[0][1].headers.get('Authorization')).toBe('Bearer real-admin-token');
});
test('admin tokens cannot be forwarded to another origin',async()=>{
    localStorage.setItem('adminToken','real-admin-token');
    await expect(adminFetch('https://example.com/api/admin/users')).rejects.toThrow('Invalid API destination');expect(fetch).not.toHaveBeenCalled();
});
