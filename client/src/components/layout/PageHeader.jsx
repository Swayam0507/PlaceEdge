import Breadcrumb from "./Breadcrumb";

const PageHeader = ({ title, description, actions }) => {
  return (
    <div className="page-header-bar">
      <Breadcrumb />
      <div className="page-header-content">
        <div className="page-header-text">
          <h1 className="page-header-title">{title}</h1>
          {description && <p className="page-header-desc">{description}</p>}
        </div>
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
