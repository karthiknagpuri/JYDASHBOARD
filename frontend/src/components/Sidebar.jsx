import React from 'react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  Upload, 
  Users, 
  BarChart3, 
  TrendingUp, 
  Shield, 
  Home, 
  Menu,
  X
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, participants = [], isMobile, isOpen, setIsOpen }) => {
  const navigationItems = [
    {
      id: 0,
      label: 'Upload CSV',
      icon: Upload,
      description: 'Import participant data'
    },
    {
      id: 1,
      label: `Participants (${participants.length})`,
      icon: Users,
      description: 'View all participants'
    },
    {
      id: 2,
      label: 'Analytics',
      icon: BarChart3,
      description: 'Data visualizations'
    },
    {
      id: 3,
      label: 'Executive KPIs',
      icon: TrendingUp,
      description: 'Key performance indicators'
    },
    {
      id: 4,
      label: 'Data Quality',
      icon: Shield,
      description: 'Data accuracy report'
    }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
        
        {/* Mobile Sidebar */}
        <div className={cn(
          "fixed left-0 top-0 z-50 h-full w-80 bg-background border-r transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <SidebarContent 
            navigationItems={navigationItems} 
            activeTab={activeTab} 
            handleNavClick={handleNavClick}
            participants={participants}
            isMobile={true}
            setIsOpen={setIsOpen}
          />
        </div>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div className="w-80 bg-background border-r flex-shrink-0">
      <SidebarContent 
        navigationItems={navigationItems} 
        activeTab={activeTab} 
        handleNavClick={handleNavClick}
        participants={participants}
        isMobile={false}
      />
    </div>
  );
};

const SidebarContent = ({ navigationItems, activeTab, handleNavClick, participants, isMobile, setIsOpen }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Jagriti Yatra</h1>
              <p className="text-sm text-muted-foreground">Participant Dashboard</p>
            </div>
          </div>
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-auto p-4 text-left",
                isActive && "bg-primary text-primary-foreground"
              )}
              onClick={() => handleNavClick(item.id)}
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.label}</div>
                  <div className={cn(
                    "text-xs truncate",
                    isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {item.description}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Stats Card */}
      <div className="p-4 border-t">
        <Card className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">{participants.length}</div>
                <div className="text-muted-foreground text-xs">Total Participants</div>
              </div>
              <div>
                <div className="font-medium">
                  {participants.filter(p => p.yatri_type === 'facilitator').length}
                </div>
                <div className="text-muted-foreground text-xs">Facilitators</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Mobile Menu Button Component
export const MobileMenuButton = ({ isOpen, setIsOpen }) => (
  <Button
    variant="outline"
    size="icon"
    className="md:hidden fixed top-4 left-4 z-50"
    onClick={() => setIsOpen(!isOpen)}
  >
    {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
  </Button>
);

export default Sidebar;