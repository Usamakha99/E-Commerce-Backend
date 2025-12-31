import { Link } from 'react-router-dom';
const LogoBox = ({
  containerClassName,
  squareLogo,
  textLogo
}) => {
  return <div className={containerClassName ?? ''}>
      <Link to="/" className="logo-dark">
        <img src="/V Cloud Logo final-01.svg" className={textLogo?.className} height={textLogo?.height ?? 40} width={textLogo?.width ?? 200} alt="V Cloud Logo" style={{ objectFit: 'contain' }} />
      </Link>
      <Link to="/" className="logo-light">
        <img src="/V Cloud Logo final-01.svg" className={textLogo?.className} height={textLogo?.height ?? 40} width={textLogo?.width ?? 200} alt="V Cloud Logo" style={{ objectFit: 'contain' }} />
      </Link>
    </div>;
};
export default LogoBox;