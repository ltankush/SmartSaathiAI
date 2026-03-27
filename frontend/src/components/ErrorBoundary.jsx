import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-sm text-[#8b949e]">Something went wrong rendering this section.</p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
            className="btn-primary text-xs py-2 px-4"
          >
            Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
