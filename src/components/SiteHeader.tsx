import { useEffect, useRef, useState } from "react";
import { pages, pageHref, type PageId } from "../utils/navigation";

export default function SiteHeader({ page }: { page: PageId }) {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setOpen(false);
  }, [page]);
  return (
    <header
      className="site-header"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          menuButton.current?.focus();
        }
      }}
    >
      <a className="brand" href="#home" aria-label="深海首页">
        <span className="brand-icon" aria-hidden="true">
          ≋
        </span>{" "}
        深海
        <span className="brand-en">DEEP SEA</span>
      </a>
      <button
        ref={menuButton}
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="site-navigation"
        onClick={() => setOpen(!open)}
      >
        {open ? "关闭导航 ×" : "网站导航 ≡"}
      </button>
      <nav
        id="site-navigation"
        className={`site-navigation ${open ? "is-open" : ""}`}
        aria-label="主导航"
      >
        {pages.map((item) => (
          <a
            key={item.id}
            href={pageHref(item.id)}
            aria-current={page === item.id ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
