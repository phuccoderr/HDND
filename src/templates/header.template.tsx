import { Button } from "@/components/ui/button";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider.template";
import { useSidebar } from "@/components/ui/sidebar";

const Header = () => {
  const { toggleSidebar } = useSidebar();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    // Nếu đang là dark thì đổi thành light, và ngược lại
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="sticky top-0 z-10">
      <div className="flex justify-between p-2 items-center">
        <Button onClick={toggleSidebar} variant="outline" size="icon">
          <Menu />
        </Button>
        {/* Theme */}
        <Button onClick={toggleTheme} variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </div>
  );
};

export default Header;
