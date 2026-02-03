import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomFieldsManager } from '@/components/admin/CustomFieldsManager';
import { ExcelTemplateDownload } from '@/components/admin/ExcelTemplateDownload';
import { ExcelUpload } from '@/components/admin/ExcelUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DEPARTMENTS = [
  'Recruiter',
  'Account Manager',
  'Business Development',
  'Operations Manager',
];

export function AdminView() {
  const [activeDepartment, setActiveDepartment] = useState('Recruiter');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-muted-foreground">Manage KPIs and Custom Fields across departments</p>
      </div>

      <Tabs value={activeDepartment} onValueChange={setActiveDepartment}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
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
    </div>
  );
}
