import { Component, type ReactNode } from "react";

export default class PageBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div className="section empty-state" role="alert">
          <h2>页面暂时没能打开</h2>
          <p>网络恢复后，可以重新加载。也可以从上方导航前往其他页面。</p>
          <button className="primary-button" onClick={() => location.reload()}>
            重新加载
          </button>
        </div>
      );
    return this.props.children;
  }
}
