// Main application layout component

// Node imports
import { Outlet } from 'react-router-dom';


// Local imports
import * as styles from './Layout.css'; // vanilla-extract styling
import Header from './Header';
import Footer from './Footer';


// React component Layout
function Layout() {
  return (
    // <div className='app'>
    <div className={styles.app}>
      <Header />
      {/* <div className='appContent'> */}
      <div className={styles.appContent}>
        {/* Page Content. Note that child routes are rendered through <Outlet/> rather than {props.children}! */}
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

export default Layout