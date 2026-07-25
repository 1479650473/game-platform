import { useTheme } from '../context/ThemeContext'

interface Props {
  onClose: () => void
}

export default function SettingsDialog({ onClose }: Props) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box settings-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>设置</h3>

        <div className="settings-section">
          <label className="settings-label">主题</label>
          <div className="theme-segment">
            <button
              className={`theme-segment-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => { if (theme !== 'dark') toggleTheme() }}
            >
              暗色
            </button>
            <button
              className={`theme-segment-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => { if (theme !== 'light') toggleTheme() }}
            >
              亮色
            </button>
          </div>
        </div>

        <div className="dialog-actions">
          <button className="dialog-btn dialog-btn-add" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  )
}
