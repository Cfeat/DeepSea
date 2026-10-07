import { lazy, Suspense, useState } from "react";
import type { Creature } from "../../data/types";
import { games } from "../../games/catalog";
import "../../styles/games.css";

const StoryGame = lazy(() => import("./StoryGame"));
const StationGame = lazy(() => import("./StationGame"));
function hasSave(key: string) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw.length > 300000) return false;
    const parsed = JSON.parse(raw);
    return (
      [1, 2].includes(parsed?.version) &&
      typeof parsed.setup?.name === "string" &&
      Array.isArray(parsed.actions)
    );
  } catch {
    return false;
  }
}
export default function GamesPage({
  gameId,
  onOpen,
}: {
  gameId?: string;
  onOpen: (creature: Creature) => void;
}) {
  const [saved] = useState(() => games.map((game) => hasSave(game.key)));
  if (gameId) {
    return (
      <Suspense
        fallback={
          <p className="page-loading" role="status">
            正在打开游戏…
          </p>
        }
      >
        {gameId === "story" ? (
          <StoryGame onOpen={onOpen} />
        ) : gameId === "station" ? (
          <StationGame onOpen={onOpen} />
        ) : (
          <section className="section">
            <h1 className="page-title">这个游戏暂时不存在</h1>
            <a className="text-button" href="#games">
              返回深海游乐场 →
            </a>
          </section>
        )}
      </Suspense>
    );
  }
  return (
    <section className="section games-hub" aria-labelledby="games-title">
      <div className="games-hub-heading">
        <div>
          <p className="eyebrow">PLAY BELOW THE SURFACE</p>
          <h1 id="games-title" className="page-title">
            深海游乐场
          </h1>
        </div>
        <p>
          暂时把身份换成潜器驾驶员，或海底站站长。
          <br />
          两段独立的旅程，从这里开始。
        </p>
      </div>
      <div className="game-entry-grid">
        {games.map((game, index) => (
          <article className={`game-entry entry-${game.id}`} key={game.id}>
            <a
              className="game-cover"
              href={`#games/${game.id}`}
              tabIndex={-1}
              aria-hidden="true"
            >
              {game.id === "story" ? (
                <>
                  <div className="cover-orbit">
                    <span>◌</span>
                    <i />
                  </div>
                  <div className="cover-transmission">
                    <span>REC / 07 SEC</span>
                    <div className="waveform">
                      {Array.from({ length: 31 }, (_, i) => (
                        <i
                          key={i}
                          style={{ height: `${8 + ((i * 13 + 17) % 46)}px` }}
                        />
                      ))}
                    </div>
                    <small>“别靠近主井……”</small>
                  </div>
                </>
              ) : (
                <>
                  <div className="cover-station">
                    <i>ϟ</i>
                    <i>◌</i>
                    <i />
                    <i>◎</i>
                    <i>⚗</i>
                    <i>⇄</i>
                  </div>
                  <div className="cover-coordinate">
                    BLUE BAY / 2,400 m<br />
                    <span>DAY 01 · STATION ONLINE</span>
                  </div>
                </>
              )}
            </a>
            <div className="game-entry-copy">
              <p className="eyebrow">
                0{index + 1} / {game.type}
              </p>
              <h2>{game.name}</h2>
              <p>{game.description}</p>
              <ul>
                {game.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <div className="game-entry-bottom">
                <a href={`#games/${game.id}`} className="game-button">
                  {saved[index] ? `继续${game.name}` : `进入${game.name}`} →
                </a>
                <span>
                  {game.duration}
                  <br />
                  {saved[index] ? "此浏览器已有存档" : "按自己的节奏游玩"}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="games-hub-notes">
        <div>
          <span>01</span>
          <h2>随时停下，回来接着玩</h2>
          <p>进度保存在当前浏览器。需要换设备时，可在游戏内导出和导入存档。</p>
        </div>
        <div>
          <span>02</span>
          <h2>两款游戏，各玩各的</h2>
          <p>人物、资源和存档完全独立。一次失误不会影响另一个游戏。</p>
        </div>
        <div>
          <span>03</span>
          <h2>故事里，也有真实的深海</h2>
          <p>
            情节和经营规则是虚构的；遇见的生物与环境，可打开图鉴和专题了解。
          </p>
        </div>
      </div>
    </section>
  );
}
