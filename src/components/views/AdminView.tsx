import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomFieldsManager } from '@/components/admin/CustomFieldsManager';
import { ExcelTemplateDownload } from '@/components/admin/ExcelTemplateDownload';
import { ExcelUpload } from '@/components/admin/ExcelUpload';
import { UserManagement } from '@/components/admin/UserManagement';
import { DataManagement } from '@/components/admin/DataManagement';
import { ActivityLogs } from '@/components/admin/ActivityLogs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DEPARTMENTS = [
  'Recruiter',
  'Account Manager',
  'Business Development',
  'Operations Manager',
];

export function AdminView() {
  const [activeDepartment, setActiveDepartment] = useState('Recruiter');
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-muted-foreground">Manage users, data, KPIs and activity logs</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="kpis">KPI Fields</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="kpis" className="mt-6 space-y-6">
          <Tabs value={activeDepartment} onValueChange={setActiveDepartment}>
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-2xl">
              {DEPARTMENTS.map((dept) => (
                <TabsTrigger key={dept} value={dept} className="text-xs sm:text-sm">
                  {dept.replace('Manager', 'Mgr')}
                </TabsTrigger>
              ))}
            </TabsList>

            {DEPARTMENTS.map((dept) => (
              <TabsContent key={dept} value={dept} className="space-y-6 mt-6">
                <CustomFieldsManager department={dept} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Download Excel Template</CardTitle>
                      <CardDescription>
                        Generate a template with all KPI fields for {dept}s
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ExcelTemplateDownload department={dept} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Upload KPI Data</CardTitle>
                      <CardDescription>
                        Upload a filled template to update KPI values
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ExcelUpload department={dept} />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          <DataManagement />
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <ActivityLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
}
