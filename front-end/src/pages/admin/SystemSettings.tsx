import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Save,
  RotateCcw,
  Shield,
  Mail,
  Database,
  Globe,
  Lock,
  Bell,
  Server,
  AlertTriangle,
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

const SystemSettings: React.FC = () => {
  const { systemSettings, updateSystemSettings } = useAdmin();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [settings, setSettings] = React.useState(systemSettings);

  React.useEffect(() => {
    setSettings(systemSettings);
  }, [systemSettings]);

  const handleSave = async () => {
    setIsLoading(true);
    const success = await updateSystemSettings(settings);

    if (success) {
      toast({
        title: "Settings saved successfully",
        description: "System settings have been updated",
      });
    } else {
      toast({
        title: "Error saving settings",
        description: "Please try again",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleReset = () => {
    setSettings(systemSettings);
    toast({
      title: "Settings reset",
      description: "Changes have been reverted",
    });
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateNestedSetting = (section: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              System Settings
            </h1>
            <p className="text-muted-foreground">
              Configure system-wide settings and preferences
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => updateSetting("siteName", e.target.value)}
                placeholder="TAQAMOROCCO Anomaly Management"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow User Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new users to register accounts
                </p>
              </div>
              <Switch
                checked={settings.allowRegistration}
                onCheckedChange={(checked) =>
                  updateSetting("allowRegistration", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable access to the system
                </p>
              </div>
              <div className="flex items-center gap-2">
                {settings.maintenanceMode && (
                  <Badge variant="destructive">Active</Badge>
                )}
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    updateSetting("maintenanceMode", checked)
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                min="1"
                max="100"
                value={settings.maxFileSize}
                onChange={(e) =>
                  updateSetting("maxFileSize", parseInt(e.target.value))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Allowed File Types</Label>
              <div className="flex flex-wrap gap-2">
                {settings.allowedFileTypes.map((type) => (
                  <Badge key={type} variant="secondary">
                    {type}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Contact support to modify allowed file types
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
              <Input
                id="passwordMinLength"
                type="number"
                min="6"
                max="32"
                value={settings.securitySettings.passwordMinLength}
                onChange={(e) =>
                  updateNestedSetting(
                    "securitySettings",
                    "passwordMinLength",
                    parseInt(e.target.value),
                  )
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Force all users to enable 2FA
                </p>
              </div>
              <Switch
                checked={settings.securitySettings.requireTwoFactor}
                onCheckedChange={(checked) =>
                  updateNestedSetting(
                    "securitySettings",
                    "requireTwoFactor",
                    checked,
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                min="5"
                max="480"
                value={settings.securitySettings.sessionTimeout}
                onChange={(e) =>
                  updateNestedSetting(
                    "securitySettings",
                    "sessionTimeout",
                    parseInt(e.target.value),
                  )
                }
              />
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Security Notice
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Changes to security settings will affect all users and may
                    require re-authentication.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email notifications for critical events
                </p>
              </div>
              <Switch
                checked={settings.notificationSettings.emailNotifications}
                onCheckedChange={(checked) =>
                  updateNestedSetting(
                    "notificationSettings",
                    "emailNotifications",
                    checked,
                  )
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Slack Integration</Label>
                <p className="text-sm text-muted-foreground">
                  Send notifications to Slack channels
                </p>
              </div>
              <Switch
                checked={settings.notificationSettings.slackIntegration}
                onCheckedChange={(checked) =>
                  updateNestedSetting(
                    "notificationSettings",
                    "slackIntegration",
                    checked,
                  )
                }
              />
            </div>

            {settings.notificationSettings.slackIntegration && (
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Slack Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  value={settings.notificationSettings.webhookUrl || ""}
                  onChange={(e) =>
                    updateNestedSetting(
                      "notificationSettings",
                      "webhookUrl",
                      e.target.value,
                    )
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Version</Label>
                <p className="text-sm text-muted-foreground">v2.1.0</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Environment</Label>
                <Badge variant="outline">Production</Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Database</Label>
                <p className="text-sm text-muted-foreground">PostgreSQL 14.0</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Uptime</Label>
                <p className="text-sm text-muted-foreground">
                  15 days, 4 hours
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm font-medium">System Health</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database Connection</span>
                  <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">File Storage</span>
                  <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Service</span>
                  <Badge className="bg-green-100 text-green-800">
                    Connected
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Settings */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Database Management</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="mr-2 h-4 w-4" />
                  Backup Database
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restore from Backup
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">System Maintenance</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Server className="mr-2 h-4 w-4" />
                  Clear Cache
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="mr-2 h-4 w-4" />
                  Test Connections
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
