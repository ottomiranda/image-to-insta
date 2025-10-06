import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, Globe, GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useOnboarding } from "@/hooks/useOnboarding";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserNavProps {
  onSettingsClick: () => void;
}

export function UserNav({ onSettingsClick }: UserNavProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const { restartTour } = useOnboarding();
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error("Error loading user:", error);
          navigate("/auth");
          return;
        }

        setUserEmail(user.email || "");
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: t('userNav.errorSigningOut'),
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      navigate("/auth");
    } catch (error) {
      toast({
        title: t('userNav.errorSigningOut'),
        description: t('userNav.unexpectedError'),
        variant: "destructive",
      });
    }
  };

  const getInitials = (email: string) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <User className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(userEmail)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-background" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{t('userNav.account')}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSettingsClick} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>{t('userNav.settings')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            try {
              await restartTour();
            } finally {
              navigate("/campaigns?tour=start");
            }
          }}
          className="cursor-pointer"
        >
          <GraduationCap className="mr-2 h-4 w-4" />
          <span>{t('userNav.guidedTour')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={(e) => e.preventDefault()}>
          <Globe className="mr-2 h-4 w-4" />
          <span className="mr-2">{t('userNav.language')}:</span>
          <button
            onClick={() => i18n.changeLanguage('en')}
            className={`px-2 py-0.5 text-xs rounded ${i18n.language === 'en' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            EN
          </button>
          <button
            onClick={() => i18n.changeLanguage('pt')}
            className={`px-2 py-0.5 text-xs rounded ml-1 ${i18n.language === 'pt' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            PT
          </button>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('userNav.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
