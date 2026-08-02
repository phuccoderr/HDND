import { Button } from "@/components/ui/button";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider.template";
import { useSidebar } from "@/components/animate-ui/components/radix/sidebar";
import { useStoreButtonHeader } from "@/stores/work-space.store";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/apis/http.client";
import type { Command } from "@/apis/commands.api";
import type { Duty } from "@/apis/duties.api";

const Header = () => {
  const { toggleSidebar } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { open, handleClick } = useStoreButtonHeader();
  const [command, setCommand] = useState<Command | null>();
  const [duty, setDuty] = useState<Duty | null>();
  const toDay = new Date().toISOString();

  const toggleTheme = () => {
    // Nếu đang là dark thì đổi thành light, và ngược lại
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    const fetchCommand = async () => {
      const { data } = await supabaseClient
        .from("commands")
        .select(
          `
        *,
        employee:employees (*)
      `,
        )
        .lte("start_time", toDay)
        .gte("end_time", toDay);
      setCommand(data?.[0]);
    };

    const fetchDuty = async () => {
      const { data } = await supabaseClient
        .from("duties")
        .select(
          `
        *,
        employee:employees (*)
      `,
        )
        .lte("start_time", toDay)
        .gte("end_time", toDay);
      setDuty(data?.[0]);
    };

    fetchCommand();
    fetchDuty();
  }, []);

  return (
    <div className="sticky top-0 z-20 border-b  bg-background/70 backdrop-blur-md ">
      <div className="flex justify-between p-2 items-center">
        <div className="flex gap-2">
          <Button onClick={toggleSidebar} variant="outline" size="icon">
            <Menu />
          </Button>
          <div className="flex flex-col text-xs">
            <span>Chỉ huy: {command?.employee?.full_name}</span>
            <span>Trực ban: {duty?.employee?.full_name}</span>
          </div>
        </div>
        {/* Theme */}
        <div className="flex gap-2">
          {open && <Button onClick={() => handleClick()}>Lưu</Button>}
          <Button onClick={toggleTheme} variant="outline" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Header;
