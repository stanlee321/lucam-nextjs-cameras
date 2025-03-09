import { Report, ApiResponse, PaginatedResponse, ReportFilters } from './types';
import { mockReports, reportTypes, getNextId, getCurrentTimestamp } from './mockData';

// In-memory store of reports (to simulate a database)
let reports = [...mockReports];

// Helper function to log activity
const logReportActivity = (action: string, details: string) => {
  // In a real implementation, this would call an API endpoint
  console.log(`Activity Log: ${action} - ${details}`);
};

// Get all reports (with optional filters)
export const getReports = async (
  filters?: ReportFilters
): Promise<ApiResponse<PaginatedResponse<Report>>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  try {
    let filteredReports = [...reports];

    // Apply filters
    if (filters) {
      if (filters.type) {
        filteredReports = filteredReports.filter(report => 
          report.type.toLowerCase() === filters.type!.toLowerCase()
        );
      }

      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filteredReports = filteredReports.filter(report => 
          new Date(report.generatedOn) >= startDate
        );
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        // Include the entire end date by setting it to the end of the day
        endDate.setHours(23, 59, 59, 999);
        filteredReports = filteredReports.filter(report => 
          new Date(report.generatedOn) <= endDate
        );
      }
    }

    // Sort by generation date (newest first)
    filteredReports.sort((a, b) => 
      new Date(b.generatedOn).getTime() - new Date(a.generatedOn).getTime()
    );

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReports = filteredReports.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        data: paginatedReports,
        total: filteredReports.length,
        page,
        limit,
      },
    };
  } catch (error) {
    console.error('Error getting reports:', error);
    return {
      success: false,
      error: 'Failed to fetch reports. Please try again.',
    };
  }
};

// Get a single report by ID
export const getReportById = async (id: number): Promise<ApiResponse<Report>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    const report = reports.find(r => r.id === id);

    if (!report) {
      return {
        success: false,
        error: `Report with ID ${id} not found.`,
      };
    }

    return {
      success: true,
      data: report,
    };
  } catch (error) {
    console.error(`Error getting report ${id}:`, error);
    return {
      success: false,
      error: 'Failed to fetch report details. Please try again.',
    };
  }
};

// Get available report types
export const getReportTypes = async (): Promise<ApiResponse<string[]>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));

  try {
    return {
      success: true,
      data: reportTypes,
    };
  } catch (error) {
    console.error('Error getting report types:', error);
    return {
      success: false,
      error: 'Failed to fetch report types. Please try again.',
    };
  }
};

// Generate a new report
export const generateReport = async (
  type: string,
  params: {
    startDate?: string;
    endDate?: string;
    format: 'PDF' | 'CSV';
    [key: string]: any;
  }
): Promise<ApiResponse<Report>> => {
  // Simulate network delay (report generation takes time)
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    // Validate report type
    if (!reportTypes.includes(type)) {
      return {
        success: false,
        error: `Invalid report type: ${type}`,
      };
    }

    // Format dates for the report name
    const startDateStr = params.startDate 
      ? new Date(params.startDate).toISOString().slice(0, 10) 
      : '';
    const endDateStr = params.endDate
      ? new Date(params.endDate).toISOString().slice(0, 10)
      : '';
    
    // Create a unique filename
    let filename = type.replace(/\s+/g, '_');
    if (startDateStr && endDateStr) {
      filename += `_${startDateStr}_to_${endDateStr}`;
    } else if (startDateStr) {
      filename += `_from_${startDateStr}`;
    } else if (endDateStr) {
      filename += `_until_${endDateStr}`;
    } else {
      // If no date range, use current month/year
      const now = new Date();
      const month = now.toLocaleString('en-US', { month: 'short' });
      const year = now.getFullYear();
      filename += `_${month}_${year}`;
    }

    // Add a random suffix to ensure uniqueness
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    filename += `_${randomSuffix}`;

    const newReport: Report = {
      id: getNextId(reports),
      name: filename,
      generatedOn: getCurrentTimestamp(),
      type: type,
      format: params.format,
      url: `/reports/${filename}.${params.format.toLowerCase()}`,
    };

    reports.push(newReport);

    // Log activity
    logReportActivity('Generated Report', `Generated "${type}" Report (${params.format})`);

    return {
      success: true,
      data: newReport,
    };
  } catch (error) {
    console.error('Error generating report:', error);
    return {
      success: false,
      error: 'Failed to generate report. Please try again.',
    };
  }
};

// Download a report (in a real app, this would return a file)
export const downloadReport = async (id: number): Promise<ApiResponse<string>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const report = reports.find(r => r.id === id);

    if (!report) {
      return {
        success: false,
        error: `Report with ID ${id} not found.`,
      };
    }

    // Log activity
    logReportActivity('Downloaded Report', `Downloaded "${report.name}"`);

    // In a real implementation, this would generate a file stream
    // Here we just return the URL
    return {
      success: true,
      data: report.url,
    };
  } catch (error) {
    console.error(`Error downloading report ${id}:`, error);
    return {
      success: false,
      error: 'Failed to download report. Please try again.',
    };
  }
};

// Delete a report
export const deleteReport = async (id: number): Promise<ApiResponse<void>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    const index = reports.findIndex(r => r.id === id);

    if (index === -1) {
      return {
        success: false,
        error: `Report with ID ${id} not found.`,
      };
    }

    const reportName = reports[index].name;
    reports = reports.filter(r => r.id !== id);

    // Log activity
    logReportActivity('Deleted Report', `Deleted report "${reportName}"`);

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Error deleting report ${id}:`, error);
    return {
      success: false,
      error: 'Failed to delete report. Please try again.',
    };
  }
};

// Reset reports to default (for testing purposes)
export const resetReports = () => {
  reports = [...mockReports];
}; 