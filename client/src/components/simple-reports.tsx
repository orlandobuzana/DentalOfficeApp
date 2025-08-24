import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileText, Eye } from "lucide-react";
import { AppointmentsPopup } from "./appointments-popup";

interface ReportData {
  appointments?: {
    totalAppointments: number;
    confirmedAppointments: number;
    pendingAppointments: number;
    appointments: Array<{
      patientId: string;
      doctorName: string;
      treatmentType: string;
      appointmentDate: string;
      appointmentTime: string;
      status: string;
    }>;
  };
}

export function SimpleReportsManagement() {
  const [reportType, setReportType] = useState<string>('appointments');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showResults, setShowResults] = useState<boolean>(false);

  const { data: reportData, isLoading, refetch } = useQuery<ReportData>({
    queryKey: ['/api/reports', reportType, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        type: reportType,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });
      const response = await fetch(`/api/reports?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }
      return response.json();
    },
    enabled: false,
  });

  const handleGenerateReport = () => {
    refetch();
    setShowResults(true);
  };

  const downloadReport = () => {
    let content = `DENTAL PRACTICE REPORT\n`;
    content += `Report Type: ${reportType.toUpperCase()}\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;
    if (startDate) content += `Start Date: ${startDate}\n`;
    if (endDate) content += `End Date: ${endDate}\n`;
    content += `\n`;

    if (reportData?.appointments) {
      content += `APPOINTMENTS SUMMARY\n`;
      content += `Total Appointments: ${reportData.appointments.totalAppointments || 0}\n`;
      content += `Confirmed: ${reportData.appointments.confirmedAppointments || 0}\n`;
      content += `Pending: ${reportData.appointments.pendingAppointments || 0}\n\n`;
      
      if (reportData.appointments.appointments?.length > 0) {
        content += `APPOINTMENT DETAILS\n`;
        reportData.appointments.appointments.forEach((apt, i) => {
          content += `${i + 1}. ${apt.treatmentType} - ${apt.doctorName} - ${apt.appointmentDate} ${apt.appointmentTime} - ${apt.status}\n`;
        });
      }
    } else {
      content += `No report data available. Generate a report first.\n`;
    }

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dental-${reportType}-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    let csv = '';
    
    if (reportData?.appointments?.appointments) {
      csv = 'Patient ID,Doctor,Treatment,Date,Time,Status\n';
      reportData.appointments.appointments.forEach((apt) => {
        csv += `"${apt.patientId}","${apt.doctorName}","${apt.treatmentType}","${apt.appointmentDate}","${apt.appointmentTime}","${apt.status}"\n`;
      });
    } else {
      csv = 'No data available\n';
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dental-${reportType}-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Reports</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="report-type">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="report-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appointments">Appointments</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="patients">Patients</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleGenerateReport}
          className="w-full"
          disabled={isLoading}
          data-testid="button-generate-report"
        >
          {isLoading ? 'Generating...' : 'Generate Report'}
        </Button>

        {/* Download Buttons */}
        <div className="flex gap-4">
          <Button 
            onClick={downloadReport}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-download-text"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report (.txt)
          </Button>
          
          <Button 
            onClick={downloadCSV}
            className="bg-green-600 hover:bg-green-700"
            data-testid="button-download-csv"
          >
            <FileText className="h-4 w-4 mr-2" />
            Download Data (.csv)
          </Button>
        </div>

        {/* Results */}
        {showResults && (
          <Card>
            <CardHeader>
              <CardTitle>Report Results</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && <p>Loading report data...</p>}
              
              {!isLoading && reportData?.appointments && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 p-4 rounded">
                      <p className="text-2xl font-bold text-blue-600">
                        {reportData.appointments.totalAppointments || 0}
                      </p>
                      <p className="text-sm text-gray-600">Total Appointments</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded">
                      <p className="text-2xl font-bold text-green-600">
                        {reportData.appointments.confirmedAppointments || 0}
                      </p>
                      <p className="text-sm text-gray-600">Confirmed</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded">
                      <p className="text-2xl font-bold text-yellow-600">
                        {reportData.appointments.pendingAppointments || 0}
                      </p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                  </div>
                  
                  {reportData.appointments.appointments?.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Recent Appointments</h4>
                        <AppointmentsPopup>
                          <Button 
                            variant="outline" 
                            size="sm"
                            data-testid="button-view-all-appointments"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View All
                          </Button>
                        </AppointmentsPopup>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {reportData.appointments.appointments.slice(0, 10).map((apt, i) => (
                          <div key={i} className="p-3 bg-gray-50 rounded text-sm">
                            <p><strong>{apt.treatmentType}</strong> with {apt.doctorName}</p>
                            <p>{apt.appointmentDate} at {apt.appointmentTime} - <span className="capitalize">{apt.status}</span></p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {!isLoading && !reportData && (
                <p className="text-gray-500">No data available for the selected criteria.</p>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}