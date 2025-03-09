import { ApiResponse, Report, ReportFilters, PaginatedResponse } from './types';
import { apiClient } from './apiClient';
import { mockReports, reportTypes } from './mockData';

// Toggle API mode
const API_ENABLED = false;

class ReportService {
  /**
   * Get all reports with optional filtering and pagination
   */
  async getReports(filters?: ReportFilters): Promise<ApiResponse<PaginatedResponse<Report>>> {
    if (API_ENABLED) {
      return apiClient.get<PaginatedResponse<Report>>('/reports', filters);
    }
    
    // Mock implementation
    const { page = 1, limit = 10, type, startDate, endDate } = filters || {};
    
    // Filter reports
    let filteredReports = [...mockReports];
    
    if (type) {
      filteredReports = filteredReports.filter(report => report.type === type);
    }
    
    if (startDate) {
      const start = new Date(startDate);
      filteredReports = filteredReports.filter(report => new Date(report.generatedOn) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      filteredReports = filteredReports.filter(report => new Date(report.generatedOn) <= end);
    }
    
    // Sort by generatedOn (newest first)
    filteredReports.sort((a, b) => 
      new Date(b.generatedOn).getTime() - new Date(a.generatedOn).getTime()
    );
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReports = filteredReports.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: {
        data: paginatedReports,
        total: filteredReports.length,
        page,
        limit
      }
    };
  }
  
  /**
   * Get a report by ID
   */
  async getReportById(id: number): Promise<ApiResponse<Report>> {
    if (API_ENABLED) {
      return apiClient.get<Report>(`/reports/${id}`);
    }
    
    // Mock implementation
    const report = mockReports.find(r => r.id === id);
    
    if (!report) {
      return {
        success: false,
        error: 'Report not found'
      };
    }
    
    return {
      success: true,
      data: { ...report }
    };
  }
  
  /**
   * Get available report types
   */
  async getReportTypes(): Promise<ApiResponse<string[]>> {
    if (API_ENABLED) {
      return apiClient.get<string[]>('/reports/types');
    }
    
    // Mock implementation
    return {
      success: true,
      data: reportTypes
    };
  }
  
  /**
   * Generate a new report
   */
  async generateReport(params: { 
    type: string; 
    format: 'PDF' | 'CSV';
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<Report>> {
    if (API_ENABLED) {
      return apiClient.post<Report>('/reports', params);
    }
    
    // Mock implementation
    const { type, format, startDate, endDate } = params;
    
    // Generate a report name
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const nameType = type.replace(/\s+/g, '_');
    const reportName = `${nameType}_${year}_${month}_${day}`;
    
    const newReport: Report = {
      id: Math.max(...mockReports.map(r => r.id), 0) + 1,
      name: reportName,
      generatedOn: new Date().toISOString(),
      type,
      format,
      url: `/reports/${reportName}.${format.toLowerCase()}`
    };
    
    mockReports.push(newReport);
    
    return {
      success: true,
      data: { ...newReport }
    };
  }
  
  /**
   * Delete a report
   */
  async deleteReport(id: number): Promise<ApiResponse<{ message: string, id: number }>> {
    if (API_ENABLED) {
      return apiClient.delete<{ message: string, id: number }>(`/reports/${id}`);
    }
    
    // Mock implementation
    const reportIndex = mockReports.findIndex(r => r.id === id);
    
    if (reportIndex === -1) {
      return {
        success: false,
        error: 'Report not found'
      };
    }
    
    mockReports.splice(reportIndex, 1);
    
    return {
      success: true,
      data: {
        message: 'Report deleted successfully',
        id
      }
    };
  }
}

export const reportService = new ReportService(); 