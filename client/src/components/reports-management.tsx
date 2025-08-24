import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, FileText, Users, CreditCard, Download, Calendar, TrendingUp, FileDown } from "lucide-react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ReportData {
  appointments?: {
    totalAppointments: number;
    confirmedAppointments: number;
    pendingAppointments: number;
    cancelledAppointments: number;
    appointmentsByTreatment: Record<string, number>;
    appointmentsByDoctor: Record<string, number>;
    appointments: any[];
  };
  payments?: {
    totalRevenue: number;
    totalInsuranceCovered: number;
    totalPatientPaid: number;
    paymentsByMethod: Record<string, number>;
    paymentsByProcedure: Record<string, number>;
    payments: any[];
  };
  patients?: {
    totalPatients: number;
    newPatientsThisMonth: number;
    patients: any[];
  };
}

export function ReportsManagement() {
  const [reportType, setReportType] = useState<string>('appointments');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showResults, setShowResults] = useState(false);

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
    enabled: false, // Don't auto-fetch
  });

  const handleGenerateReport = () => {
    refetch();
    setShowResults(true);
  };

  const exportToPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.text('Dental Practice Report', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.text(`Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Generated: ${currentDate}`, 20, yPosition);
    yPosition += 7;
    
    if (startDate || endDate) {
      doc.text(`Date Range: ${startDate || 'Start'} to ${endDate || 'End'}`, 20, yPosition);
      yPosition += 10;
    } else {
      yPosition += 3;
    }

    // Report Content
    if (reportType === 'appointments' && reportData.appointments) {
      const { appointments, totalAppointments, confirmedAppointments, pendingAppointments } = reportData.appointments;
      
      // Summary
      doc.setFontSize(16);
      doc.text('Appointments Summary', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.text(`Total Appointments: ${totalAppointments}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Confirmed: ${confirmedAppointments}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Pending: ${pendingAppointments}`, 20, yPosition);
      yPosition += 15;

      // Appointments Table
      if (appointments && appointments.length > 0) {
        const tableData = appointments.map(apt => [
          apt.patientName || 'N/A',
          apt.doctorName || 'N/A',
          apt.treatmentType || 'N/A',
          apt.appointmentDate || 'N/A',
          apt.appointmentTime || 'N/A',
          apt.status || 'N/A'
        ]);

        (doc as any).autoTable({
          startY: yPosition,
          head: [['Patient', 'Doctor', 'Treatment', 'Date', 'Time', 'Status']],
          body: tableData,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [37, 99, 235] },
        });
      }
    }
    
    if (reportType === 'financial' && reportData.payments) {
      const { payments, totalRevenue, totalPatientPaid } = reportData.payments;
      
      // Summary
      doc.setFontSize(16);
      doc.text('Financial Summary', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.text(`Total Revenue: $${totalRevenue?.toFixed(2) || '0.00'}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Patient Payments: $${totalPatientPaid?.toFixed(2) || '0.00'}`, 20, yPosition);
      yPosition += 15;

      // Payments Table
      if (payments && payments.length > 0) {
        const tableData = payments.map(payment => [
          payment.patientName || 'N/A',
          payment.procedure || 'N/A',
          `$${payment.amount?.toFixed(2) || '0.00'}`,
          payment.paymentMethod || 'N/A',
          payment.date || 'N/A',
          payment.status || 'N/A'
        ]);

        (doc as any).autoTable({
          startY: yPosition,
          head: [['Patient', 'Procedure', 'Amount', 'Method', 'Date', 'Status']],
          body: tableData,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [37, 99, 235] },
        });
      }
    }

    if (reportType === 'patients' && reportData.patients) {
      const { patients, totalPatients, newPatientsThisMonth } = reportData.patients;
      
      // Summary
      doc.setFontSize(16);
      doc.text('Patients Summary', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.text(`Total Patients: ${totalPatients}`, 20, yPosition);
      yPosition += 7;
      doc.text(`New This Month: ${newPatientsThisMonth}`, 20, yPosition);
      yPosition += 15;

      // Patients Table
      if (patients && patients.length > 0) {
        const tableData = patients.map(patient => [
          patient.firstName || 'N/A',
          patient.lastName || 'N/A',
          patient.email || 'N/A',
          patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'
        ]);

        (doc as any).autoTable({
          startY: yPosition,
          head: [['First Name', 'Last Name', 'Email', 'Registered']],
          body: tableData,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [37, 99, 235] },
        });
      }
    }

    // Save PDF
    const filename = `dental-${reportType}-report-${currentDate.replace(/\//g, '-')}.pdf`;
    doc.save(filename);
  };

  const exportToExcel = () => {
    if (!reportData) return;

    const workbook = XLSX.utils.book_new();
    const currentDate = new Date().toLocaleDateString().replace(/\//g, '-');

    // Create data for Excel export based on report type
    if (reportType === 'appointments' && reportData.appointments) {
      const { appointments, totalAppointments, confirmedAppointments, pendingAppointments } = reportData.appointments;

      // Summary sheet
      const summaryData = [
        ['Appointments Report Summary'],
        ['Generated:', new Date().toLocaleDateString()],
        ['Date Range:', `${startDate || 'All time'} - ${endDate || 'Present'}`],
        [''],
        ['Total Appointments:', totalAppointments || 0],
        ['Confirmed:', confirmedAppointments || 0],
        ['Pending:', pendingAppointments || 0],
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Appointments detail sheet
      if (appointments && appointments.length > 0) {
        const appointmentData = appointments.map(apt => ({
          'Patient ID': apt.patientId || 'N/A',
          'Doctor': apt.doctorName || 'N/A',
          'Treatment': apt.treatmentType || 'N/A',
          'Date': apt.appointmentDate || 'N/A',
          'Time': apt.appointmentTime || 'N/A',
          'Status': apt.status || 'N/A'
        }));

        const appointmentSheet = XLSX.utils.json_to_sheet(appointmentData);
        XLSX.utils.book_append_sheet(workbook, appointmentSheet, 'Appointments');
      }
    }

    if (reportType === 'financial' && reportData.payments) {
      const { payments, totalRevenue, totalPatientPaid, totalInsuranceCovered } = reportData.payments;

      // Financial summary
      const summaryData = [
        ['Financial Report Summary'],
        ['Generated:', new Date().toLocaleDateString()],
        ['Date Range:', `${startDate || 'All time'} - ${endDate || 'Present'}`],
        [''],
        ['Total Revenue:', `$${totalRevenue?.toFixed(2) || '0.00'}`],
        ['Patient Payments:', `$${totalPatientPaid?.toFixed(2) || '0.00'}`],
        ['Insurance Covered:', `$${totalInsuranceCovered?.toFixed(2) || '0.00'}`],
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Payments detail sheet
      if (payments && payments.length > 0) {
        const paymentData = payments.map(payment => ({
          'Patient': payment.patientName || 'N/A',
          'Procedure': payment.procedure || 'N/A',
          'Amount': payment.amount?.toFixed(2) || '0.00',
          'Payment Method': payment.paymentMethod || 'N/A',
          'Date': payment.date || 'N/A',
          'Status': payment.status || 'N/A'
        }));

        const paymentSheet = XLSX.utils.json_to_sheet(paymentData);
        XLSX.utils.book_append_sheet(workbook, paymentSheet, 'Payments');
      }
    }

    if (reportType === 'patients' && reportData.patients) {
      const { patients, totalPatients, newPatientsThisMonth } = reportData.patients;

      // Patients summary
      const summaryData = [
        ['Patients Report Summary'],
        ['Generated:', new Date().toLocaleDateString()],
        [''],
        ['Total Patients:', totalPatients || 0],
        ['New This Month:', newPatientsThisMonth || 0],
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Patients detail sheet
      if (patients && patients.length > 0) {
        const patientData = patients.map(patient => ({
          'First Name': patient.firstName || 'N/A',
          'Last Name': patient.lastName || 'N/A',
          'Email': patient.email || 'N/A',
          'Registration Date': patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'
        }));

        const patientSheet = XLSX.utils.json_to_sheet(patientData);
        XLSX.utils.book_append_sheet(workbook, patientSheet, 'Patients');
      }
    }

    // Save Excel file
    const filename = `dental-${reportType}-report-${currentDate}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getDefaultDateRange = () => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      start: firstDayOfMonth.toISOString().split('T')[0],
      end: lastDayOfMonth.toISOString().split('T')[0]
    };
  };

  const defaultDates = getDefaultDateRange();
  
  if (!startDate) setStartDate(defaultDates.start);
  if (!endDate) setEndDate(defaultDates.end);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Reports Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate and analyze practice reports
          </p>
        </div>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Generate Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointments">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Appointments Report
                    </div>
                  </SelectItem>
                  <SelectItem value="payments">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Financial Report
                    </div>
                  </SelectItem>
                  <SelectItem value="patients">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Patient Report
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={handleGenerateReport}
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Generate Report
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Report Results */}
      {showResults && reportData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          {reportType === 'appointments' && reportData.appointments && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Appointments</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {reportData.appointments.totalAppointments}
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Confirmed</p>
                        <p className="text-2xl font-bold text-green-600">
                          {reportData.appointments.confirmedAppointments}
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <div className="h-4 w-4 rounded-full bg-green-600"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {reportData.appointments.pendingAppointments}
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <div className="h-4 w-4 rounded-full bg-yellow-600"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Cancelled</p>
                        <p className="text-2xl font-bold text-red-600">
                          {reportData.appointments.cancelledAppointments}
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <div className="h-4 w-4 rounded-full bg-red-600"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Appointments by Treatment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(reportData.appointments.appointmentsByTreatment).map(([treatment, count]) => (
                        <div key={treatment} className="flex justify-between items-center">
                          <span className="text-sm">{treatment}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Appointments by Doctor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(reportData.appointments.appointmentsByDoctor).map(([doctor, count]) => (
                        <div key={doctor} className="flex justify-between items-center">
                          <span className="text-sm">{doctor}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {reportType === 'payments' && reportData.payments && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(reportData.payments.totalRevenue)}
                        </p>
                      </div>
                      <CreditCard className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Insurance Covered</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(reportData.payments.totalInsuranceCovered)}
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <div className="h-4 w-4 rounded-full bg-blue-600"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Patient Paid</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {formatCurrency(reportData.payments.totalPatientPaid)}
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <div className="h-4 w-4 rounded-full bg-purple-600"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(reportData.payments.paymentsByMethod).map(([method, amount]) => (
                        <div key={method} className="flex justify-between items-center">
                          <span className="text-sm capitalize">{method.replace('_', ' ')}</span>
                          <span className="font-semibold">{formatCurrency(amount as number)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Procedure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(reportData.payments.paymentsByProcedure).map(([procedure, amount]) => (
                        <div key={procedure} className="flex justify-between items-center">
                          <span className="text-sm">{procedure}</span>
                          <span className="font-semibold">{formatCurrency(amount as number)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {reportType === 'patients' && reportData.patients && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Patients</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {reportData.patients.totalPatients}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">New This Month</p>
                        <p className="text-2xl font-bold text-green-600">
                          {reportData.patients.newPatientsThisMonth}
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <div className="h-4 w-4 rounded-full bg-green-600"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {/* PDF Export Button - Universal for all reports */}
                <Button
                  onClick={exportToPDF}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Export PDF Report
                </Button>

                {/* Excel Export Button */}
                <Button
                  onClick={exportToExcel}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-export-excel"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export Excel Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}