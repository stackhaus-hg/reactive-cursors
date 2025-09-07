// Header component

// Node imports
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
// import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link } from 'react-router-dom';  // client-side page-routing replacement for href

// vanilla-extract styling
import * as styles from './Header.css';

// Local imports
import config from '../../config.js';  // Application configuration data


function Header() {

  return (
    // This is based on the basic React-Bootstrap Navbar at: https://react-bootstrap.github.io/docs/components/navbar
    // <div className='header'>
    <div className={styles.header}>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          {/* <Navbar.Brand href="/">CBV</Navbar.Brand> */}
          <Navbar.Brand as={Link} to={""}>Stackhaus</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            {/* Page navigation section on LHS of Navbar */}
            <Nav className="me-auto">            
              {/* <Nav.Link href="/">Home</Nav.Link> */}
              {/* <Nav.Link as={Link} to={""}>Home</Nav.Link> */}
              <Nav.Link as={Link} to={"doco"}>Documentation</Nav.Link>
              {/* <Nav.Link as={Link} to={"github"}>GitHub</Nav.Link> */}
              <Nav.Link as={Link} to={`${config.githubRepoURL}`} target="_blank">GitHub</Nav.Link>                     
            </Nav>
            {/* Function options on the RHS of Navbar */}
            <Nav>
              <Nav.Link as={Link} to={""}>Testing</Nav.Link>        
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  )
}

export default Header;