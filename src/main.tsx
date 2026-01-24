import React from 'react'
import ReactDOM from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import Widget from './components/Widget'
import PermissionGuard from './components/PermissionGuard'
import './index.css'
import i18n from './lib/i18n'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <PermissionGuard>
        <Widget />
      </PermissionGuard>
    </I18nextProvider>
  </React.StrictMode>,
)