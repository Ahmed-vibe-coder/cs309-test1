import { Home, TrendingUp, Video, Clock, ThumbsUp, List, History, User, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type SidebarProps = {
  isOpen: boolean;
  currentView: string;
  onViewChange: (view: string) => void;
};

export const Sidebar = ({ isOpen, currentView, onViewChange }: SidebarProps) => {
  const { user } = useAuth();

  const menuItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'trending', icon: TrendingUp, label: 'Trending' },
  ];

  const authMenuItems = user ? [
    { id: 'subscriptions', icon: Video, label: 'Subscriptions' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'liked', icon: ThumbsUp, label: 'Liked Videos' },
    { id: 'playlists', icon: List, label: 'Playlists' },
    { id: 'watch-later', icon: Clock, label: 'Watch Later' },
  ] : [];

  return (
    <>
      <aside
        className={`fixed left-0 top-14 bottom-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto py-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex items-center gap-4 px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                currentView === item.id ? 'bg-gray-100 dark:bg-gray-800' : ''
              }`}
            >
              <item.icon className={`w-6 h-6 ${currentView === item.id ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`} />
              {isOpen && (
                <span className={`font-medium ${currentView === item.id ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                  {item.label}
                </span>
              )}
            </button>
          ))}

          {user && authMenuItems.length > 0 && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>
              {authMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-4 px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    currentView === item.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                  }`}
                >
                  <item.icon className={`w-6 h-6 ${currentView === item.id ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`} />
                  {isOpen && (
                    <span className={`font-medium ${currentView === item.id ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                      {item.label}
                    </span>
                  )}
                </button>
              ))}
            </>
          )}

          <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>
          <button
            onClick={() => onViewChange('profile')}
            className={`flex items-center gap-4 px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
              currentView === 'profile' ? 'bg-gray-100 dark:bg-gray-800' : ''
            }`}
          >
            <User className={`w-6 h-6 ${currentView === 'profile' ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`} />
            {isOpen && (
              <span className={`font-medium ${currentView === 'profile' ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                Your Channel
              </span>
            )}
          </button>
          <button
            onClick={() => onViewChange('settings')}
            className={`flex items-center gap-4 px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
              currentView === 'settings' ? 'bg-gray-100 dark:bg-gray-800' : ''
            }`}
          >
            <Settings className={`w-6 h-6 ${currentView === 'settings' ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`} />
            {isOpen && (
              <span className={`font-medium ${currentView === 'settings' ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                Settings
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
