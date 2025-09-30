// Stackhaus (homepage)

// Node imports
// import { Container, Row, Col } from "react-bootstrap"; // React Bootstrap
import { Link } from 'react-router-dom';  // React Router version of href

// Vanilla Extract styling file
import * as styles from './StackhausPage.css';


// Main component
function Stackhaus() {

  return (
    <div className={styles.stackhauspage}>
      <h1 >Customisable Cursors for React</h1>
      <div className={styles.stackhauspageDemoDiv}>
        <div>
          <h3 >Add multi-layered customisable cursors to your React.js project using our ReactiveCursor component</h3>
        </div>
        <div className={styles.stackhauspageDemo}>Demo</div>
      </div>
      <div>
        <h3 className={styles.stackhauspageH3}>
          See <Link as={Link} to={"features"}>Features</Link> for an overview of cursor functionality 
          and <Link as={Link} to={"docs"}>Docs</Link> for information on implementation
        </h3>
        <h3 className={styles.stackhauspageH3}>Ready to get started? npm install @reactive-cursor</h3>
      </div>

    </div>

  )
}

export default Stackhaus