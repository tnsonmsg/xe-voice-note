
import { User, UserCheck, Cloud, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

const UserModeSelector = () => {
  const { 
    isGuest, 
    setIsGuest, 
    syncToGoogleDrive, 
    isSyncing, 
    lastSyncTime,
    googleUser,
    signInWithGoogle,
    signOut
  } = useUser();
  const { toast } = useToast();

  const handleModeChange = (guest: boolean) => {
    if (!guest && !googleUser) {
      // If switching to registered mode but no Google account, prompt sign in
      toast({
        title: "Cần đăng ký",
        description: "Vui lòng đăng ký tài khoản Google để sử dụng chế độ này",
        variant: "destructive"
      });
      return;
    }
    
    setIsGuest(guest);
    toast({
      title: guest ? "Chế độ khách" : "Chế độ đăng ký",
      description: guest ? "Dữ liệu chỉ lưu trên thiết bị" : "Dữ liệu sẽ được đồng bộ lên Google Drive",
    });
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    toast({
      title: "Đăng ký thành công",
      description: "Tài khoản Google đã được kết nối",
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Đăng xuất thành công",
      description: "Đã chuyển về chế độ khách",
    });
  };

  const handleSync = async () => {
    await syncToGoogleDrive();
    toast({
      title: "Đồng bộ thành công",
      description: "Dữ liệu đã được sao lưu lên Google Drive",
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Chế độ sử dụng
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Info */}
        {googleUser && (
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <img 
                src={googleUser.picture} 
                alt={googleUser.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="font-medium text-green-800">{googleUser.name}</div>
                <div className="text-sm text-green-600">{googleUser.email}</div>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Mode Selection */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={isGuest ? "default" : "outline"}
              onClick={() => handleModeChange(true)}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Khách
            </Button>
            <Button
              variant={!isGuest ? "default" : "outline"}
              onClick={() => handleModeChange(false)}
              className="flex items-center gap-2"
              disabled={!googleUser}
            >
              <UserCheck className="w-4 h-4" />
              Đăng ký
            </Button>
          </div>
          
          {/* Google Sign In / Sync */}
          <div className="flex items-center gap-2">
            {!googleUser ? (
              <Button
                onClick={handleGoogleSignIn}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Đăng ký Google
              </Button>
            ) : !isGuest && (
              <>
                <Button
                  onClick={handleSync}
                  disabled={isSyncing}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Cloud className="w-4 h-4" />
                  )}
                  Đồng bộ
                </Button>
                {lastSyncTime && (
                  <span className="text-sm text-muted-foreground">
                    Lần cuối: {lastSyncTime}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserModeSelector;
