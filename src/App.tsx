import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { creatures, type Creature } from "./data/creatures";
import type { DiveHandle } from "./components/DiveExplorer";
import type { AtlasFilters } from "./components/AtlasPage";
import HomePage from "./components/HomePage";
import SiteHeader from "./components/SiteHeader";
import Breadcrumb from "./components/Breadcrumb";
import PageBoundary from "./components/PageBoundary";
import { pages, readLocation } from "./utils/navigation";
import { topics } from "./data/topics";
import { readIds, writeStorage } from "./utils/storage";

const DiveExplorer = lazy(() => import("./components/DiveExplorer"));
const AtlasPage = lazy(() => import("./components/AtlasPage"));
const DepthLab = lazy(() => import("./components/DepthLab"));
const TopicsPage = lazy(() => import("./components/TopicsPage"));
const SourcesPage = lazy(() => import("./components/SourcesPage"));
const EncyclopediaModal = lazy(() => import("./components/EncyclopediaModal"));
const ids = creatures.map((creature) => creature.id);

export default function App() {
  const [route, setRoute] = useState(readLocation);
  const [filters, setFilters] = useState<AtlasFilters>({
    zone: "all",
    query: "",
    savedOnly: false,
    page: 1,
  });
  const [visited, setVisited] = useState<Set<string>>(
    () => new Set(readIds("deepsea-read", ids)),
  );
  const [saved, setSaved] = useState(() => readIds("deepsea-saved", ids));
  const [storageError, setStorageError] = useState(false);
  const dive = useRef<DiveHandle>(null);
  const pendingJump = useRef<string | null>(null);
  const main = useRef<HTMLElement>(null);
  const selected = creatures.find(
    (creature) => creature.id === route.creatureId,
  );
  const pageLabel = pages.find((page) => page.id === route.pageId)!.label;
  const topic = topics.find((item) => item.id === route.topicId);
  const routeKey = `${route.pageId}/${route.topicId || ""}`;

  useEffect(() => {
    const sync = () => setRoute(readLocation());
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      history.scrollRestoration = previousRestoration;
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    main.current?.focus({ preventScroll: true });
  }, [routeKey]);
  useEffect(() => {
    document.title = `${selected?.name || topic?.title || pageLabel} · 深海`;
  }, [selected, topic, pageLabel]);
  useEffect(() => {
    const id = route.creatureId;
    if (id && ids.includes(id)) {
      setVisited((previous) =>
        previous.has(id) ? previous : new Set(previous).add(id),
      );
    }
  }, [route.creatureId]);
  useEffect(() => {
    writeStorage("deepsea-read", [...visited]);
  }, [visited]);

  function openCreature(creature: Creature) {
    const url = new URL(location.href);
    url.searchParams.set("creature", creature.id);
    history.pushState({ deepSeaModal: creature.id }, "", url);
    setRoute(readLocation());
  }
  function closeCreature() {
    if (history.state?.deepSeaModal === selected?.id) {
      history.back();
      return;
    }
    const url = new URL(location.href);
    url.searchParams.delete("creature");
    if (!url.hash) url.hash = route.pageId;
    history.replaceState(null, "", url);
    setRoute(readLocation());
  }
  const attachDive = useCallback((handle: DiveHandle | null) => {
    dive.current = handle;
    if (handle && pendingJump.current) {
      const id = pendingJump.current;
      pendingJump.current = null;
      requestAnimationFrame(() => handle.jumpCreature(id));
    }
  }, []);
  function jumpCreature(creature: Creature) {
    const url = new URL(location.href);
    url.searchParams.delete("creature");
    url.hash = "journey";
    if (route.pageId !== "journey") pendingJump.current = creature.id;
    history.pushState(null, "", url);
    setRoute(readLocation());
    if (dive.current)
      requestAnimationFrame(() => dive.current?.jumpCreature(creature.id));
  }
  function toggleSaved(id: string) {
    const next = saved.includes(id)
      ? saved.filter((item) => item !== id)
      : [...saved, id];
    setSaved(next);
    setStorageError(!writeStorage("deepsea-saved", next));
  }

  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          main.current?.focus();
          main.current?.scrollIntoView({ behavior: "instant" });
        }}
      >
        跳至主要内容
      </a>
      <SiteHeader page={route.pageId} />
      <main
        id="main"
        ref={main}
        tabIndex={-1}
        className={`page-${route.pageId}`}
      >
        {route.pageId !== "home" && (
          <Breadcrumb label={pageLabel} topic={topic?.kicker} />
        )}
        <PageBoundary key={routeKey}>
          <Suspense
            fallback={
              <p className="page-loading" role="status">
                正在打开{pageLabel}…
              </p>
            }
          >
            {route.pageId === "home" && <HomePage />}
            {route.pageId === "journey" && (
              <DiveExplorer
                ref={attachDive}
                saved={saved}
                onSave={toggleSaved}
                onOpen={openCreature}
              />
            )}
            {route.pageId === "atlas" && (
              <AtlasPage
                filters={filters}
                onFilter={setFilters}
                saved={saved}
                visited={visited}
                storageError={storageError}
                onSave={toggleSaved}
                onOpen={openCreature}
                onJump={jumpCreature}
              />
            )}
            {route.pageId === "lab" && <DepthLab />}
            {route.pageId === "topics" && (
              <TopicsPage
                key={route.topicId || "index"}
                topicId={route.topicId}
                onOpen={openCreature}
              />
            )}
            {route.pageId === "sources" && <SourcesPage />}
          </Suspense>
        </PageBoundary>
        {route.pageId === "journey" && storageError && (
          <p role="status" className="section note">
            收藏暂时无法保存到浏览器，刷新后可能丢失。
          </p>
        )}
      </main>
      <footer className="site-footer">
        <a className="brand" href="#home">
          ≋ 深海 <span className="brand-en">DEEP SEA</span>
        </a>
        <span>从海面到海沟，了解海洋。</span>
        <a href="#sources">资料与影像出处 ↗</a>
      </footer>
      <PageBoundary key={selected?.id || "closed"}>
        <Suspense
          fallback={
            <p className="modal-loading" role="status">
              正在打开生物百科…
            </p>
          }
        >
          {selected && (
            <EncyclopediaModal
              key={selected.id}
              creature={selected}
              onClose={closeCreature}
              onJump={() => jumpCreature(selected)}
            />
          )}
        </Suspense>
      </PageBoundary>
    </>
  );
}
