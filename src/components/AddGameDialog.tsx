interface AddGameDialogProps {
  onAdd: () => void;
  onClose: () => void;
}

export function AddGameDialog({ onAdd, onClose }: AddGameDialogProps) {
  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <h3>添加新游戏</h3>
        <p className="dialog-desc">
          准备一个包含 <code>game.json</code> 和 <code>index.html</code> 的游戏文件夹，然后选择该文件夹路径。
        </p>
        <div className="dialog-game-format">
          <h4>game.json 格式：</h4>
          <pre>{`{
  "id": "my-game",
  "name": "我的游戏",
  "description": "游戏描述",
  "version": "1.0.0",
  "author": "作者",
  "entry": "index.html",
  "icon": "icon.png",
  "width": 800,
  "height": 600,
  "minWidth": 400,
  "minHeight": 300,
  "resizable": true
}`}</pre>
        </div>
        <div className="dialog-actions">
          <button className="dialog-btn dialog-btn-cancel" onClick={onClose}>
            取消
          </button>
          <button className="dialog-btn dialog-btn-add" onClick={onAdd}>
            选择文件夹
          </button>
        </div>
      </div>
    </div>
  );
}
