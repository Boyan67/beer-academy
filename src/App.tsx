import { useEffect, useState } from "react";
import { Brain, GraduationCap, User } from "lucide-react";

import { CertificateScreen } from "@/screens/Certificate";
import { CourseMap, Home, NotFound } from "@/screens/Home";
import { LessonScreen, ReviewScreen, ReviewSession, TestScreen } from "@/screens/Play";
import { Profile } from "@/screens/Profile";
import { dueReviews, useProgress } from "@/store";

function useHash() {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => {
    const onChange = () => {
      setHash(location.hash);
      window.scrollTo(0, 0);
    };
    addEventListener("hashchange", onChange);
    return () => removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

const TABS = [
  { route: "", href: "#/", label: "Учи", icon: GraduationCap },
  { route: "review", href: "#/review", label: "Преговор", icon: Brain },
  { route: "profile", href: "#/profile", label: "Профил", icon: User },
];

function TabBar({ route }: { route: string }) {
  const due = dueReviews(useProgress((s) => s.review)).length;
  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-lg border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)]">
      {TABS.map(({ route: r, href, label, icon: Icon }) => {
        const active = r === route || (r === "" && route === "course");
        return (
          <a
            key={r}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-bold ${active ? "text-brand" : "text-stone-400"}`}
          >
            <Icon size={24} strokeWidth={active ? 2.5 : 2} />
            {label}
            {r === "review" && due > 0 && (
              <span className="absolute left-1/2 top-1.5 ml-2 min-w-5 rounded-full bg-accent px-1.5 text-[11px] leading-5 text-white">{due}</span>
            )}
          </a>
        );
      })}
    </nav>
  );
}

export default function App() {
  const [route = "", param = ""] = useHash().replace(/^#\/?/, "").split("/");

  // Lessons and tests are full-screen; `key` restarts them when the id changes.
  switch (route) {
    case "lesson":
      return <LessonScreen key={param} id={param} />;
    case "test":
      return <TestScreen key={param} id={param} />;
    case "review":
      if (param === "go") return <ReviewSession />;
  }

  const screen =
    route === "" ? <Home />
    : route === "course" ? <CourseMap id={param} />
    : route === "review" ? <ReviewScreen />
    : route === "profile" ? <Profile />
    : route === "cert" ? <CertificateScreen id={param} />
    : <NotFound />;

  return (
    <div className="pb-24">
      {screen}
      <TabBar route={route} />
    </div>
  );
}
