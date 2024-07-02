import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../svgimage/Logo.svg';
import logout from '../svgimage/Logout.svg';
import './ProjectList.css'; // Assuming your CSS file is named ProjectList.css

const ProjectList = () => {
  const Navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(7);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log(token)
        if (!token) {
          Navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/project', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        });

        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        if (error.response && error.response.status === 401) {
          Navigate('/login');
        }
      }
    };

    fetchProjects();
  }, [Navigate]);
 

  const logoutHandler = () => {
    localStorage.removeItem('token');
    Navigate('/login');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (field) => {
    const order = sortOrder === 'asc' ? 'desc' : 'asc';
    // setSortField(field);
    setSortOrder(order);
    setProjects([...projects].sort((a, b) => {
      if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
      if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
      return 0;
    }));
  };

  const handleClick = (event, number) => {
    event.preventDefault();
    setCurrentPage(number);
  };

  const handleNextPage = (event) => {
              event.preventDefault();
    if (currentPage < pageNumbers.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = (event) => {
       event.preventDefault();
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleClickbtn = async (event,projectId, action) => {
          event.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        Navigate('/login');
        return;
      }

      let updatedStatus;
      if (action === 'start') updatedStatus = 'Running';
      else if (action === 'close') updatedStatus = 'Closed';
      else if (action === 'cancel') updatedStatus = 'Cancelled';

      const response = await axios.put(`http://localhost:5000/api/project/${projectId}`, {
        status: updatedStatus
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });

      // Update the project status in the local state
      const updatedProjects = projects.map(project => {
        if (project._id === projectId) {
          return { ...project, status: updatedStatus };
        }
        return project;
      });

      setProjects(updatedProjects);
    } catch (error) {
      console.error(`Error updating project status for project ${projectId}:`, error);
      // Handle error as needed (e.g., show error message)
    }
  };
  
  const formatDate = (dateString) => {
    const options = {  month: 'short',day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const filteredProjects = projects.filter(project =>
    project.projectTheme.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredProjects.length / projectsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="main-content">
      <header className="header">
        <div className="arrowcon">
          <button className="back-button"><h1>&lt;</h1></button>
          <h2 style={{ color: 'white' }}>Project Listing</h2>
        </div>
        <img src={logo} className="logo" alt="Logo" />
        <div className="sidebar-logout-mobile">
          <img src={logout} alt="Logout" onClick={logoutHandler} />
        </div>
      </header>
      <form className="create-project-form">
      <div className="table-container">
        <div className="table-header ">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-bar"
          />
          <div>Sort By:- 
         
          <select className="sort-select" onChange={(e) => handleSortChange(e.target.value)}>
            <option value="reason">Reason</option>
            <option value="division">Division</option>
            <option value="category">Category</option>
            <option value="priority">Priority</option>
            <option value="department">Department</option>
            <option value="location">Location</option>
          </select>
          
          </div>
        </div>
        <table className="project-table ">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Reason</th>
              <th>Division</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Department</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentProjects.map((project) => (
              <tr key={project._id}>
                <td>{project.projectTheme} <p style={{fontSize:'11px'}}>{formatDate(project.startDate)} to {formatDate(project.endDate)}</p></td>
                <td>{project.reason}</td>
                <td>{project.division}</td>
                <td>{project.category}</td>
                <td>{project.priority}</td>
                <td>{project.department}</td>
                <td>{project.location}</td>
                <td><h6>{project.status}</h6></td>
                <td>
                    <button className="button" onClick={(e) => handleClickbtn(e,project._id, 'start')}>Start</button>
                    <button className="button" onClick={(e) => handleClickbtn(e,project._id, 'close')}>Close</button>
                    <button className="button" onClick={(e) => handleClickbtn(e,project._id, 'cancel')}>Cancel</button>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination" style={{display:"block"}}>
          <button onClick={handlePrevPage} disabled={currentPage === 1}>&laquo;</button>
          {pageNumbers.map(number => (
            <a key={number} href="!#" onClick={(e) => handleClick(e, number)} className={number === currentPage ? 'active' : ''}>
              {number}
            </a>
          ))}
          <button onClick={handleNextPage} disabled={currentPage === pageNumbers.length}>&raquo;</button>
        </div>
      </div>
      <div className="mobile-table-header" style={{display:'none'}}>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            className="mobile-search-bar"
          />
          <div>Sort By:- 
         
          <select className="mobile-sort-select" onChange={(e) => handleSortChange(e.target.value)}>
            <option value="reason">Reason</option>
            <option value="division">Division</option>
            <option value="category">Category</option>
            <option value="priority">Priority</option>
            <option value="department">Department</option>
            <option value="location">Location</option>
          </select>
          
          </div>
        </div>
     <div className="project-cards" style={{display:"none"}}>
  {currentProjects.map((project) => (
    <div className="project-card" key={project._id}>
      <div className="project-header">
        <h3>{project.projectTheme}</h3>
        <span className="project-status">{project.status}</span>
      </div>
      <p className="project-dates">{formatDate(project.startDate)} to {formatDate(project.endDate)}</p>
      <div className="project-details">
        <p><strong>Reason:</strong> {project.reason}</p>
        <p><strong>Type:</strong> {project.type}</p>
        <p><strong>Category:</strong> {project.category}</p>
        <p><strong>Div:</strong> {project.division}</p>
        <p><strong>Dept:</strong> {project.department}</p>
        <p><strong>Location:</strong> {project.location}</p>
        <p><strong>Priority:</strong> {project.priority}</p>
      </div>
      <div className="project-actions">
        <button className="button start" onClick={(e) => handleClickbtn(e, project._id, 'start')}>Start</button>
        <button className="button close" onClick={(e) => handleClickbtn(e, project._id, 'close')}>Close</button>
        <button className="button cancel" onClick={(e) => handleClickbtn(e, project._id, 'cancel')}>Cancel</button>
      </div>
    </div>
  ))}
</div>

        <div className="mobile-pagination" style={{display:'none'}}>
          <button onClick={handlePrevPage} disabled={currentPage === 1}>&laquo;</button>
          {pageNumbers.map(number => (
            <a key={number} href="!#" onClick={(e) => handleClick(e, number)} className={number === currentPage ? 'active' : ''}>
              {number}
            </a>
          ))}
          <button onClick={handleNextPage} disabled={currentPage === pageNumbers.length}>&raquo;</button>
        </div>
    </form>
    </div>
  );
};

export default ProjectList;
