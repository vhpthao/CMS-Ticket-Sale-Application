import { Link } from 'react-router-dom';
import { Avatar} from 'antd';
import { BellOutlined, MailOutlined } from '@ant-design/icons';
import SearchComponent from '../components/SearchComponent';
import logo from './logo.png'

function Header() {
  return (
    <div className="header">
      {/* logo */}
      <Link to={'/trangchu'} style={{ marginLeft: '50px', marginBottom:'10px'}}>
        <img src={logo} alt="" width={120} height={70}/>
      </Link>
      
      {/* tim kiem */}
      <SearchComponent placeholder='Tìm kiếm ở đây...' size='large' 
      onSearch={(value: string) => {
        console.log('Search value:', value);
      }}
      style={{ width: '350px', marginLeft: '80px', marginRight:'670px'  }}/>

      {/* icons và nut DX */}
      <div className='iconsNDX'>
        <MailOutlined style={{ fontSize: '25px', marginLeft: '50px', marginRight: '10px' }} />
        <BellOutlined style={{ fontSize: '25px', marginRight:'10px' }} />
        <Avatar shape="circle" size={50} src="https://i.pinimg.com/564x/fa/85/05/fa8505aa42f880dd74e2eee9bba79647.jpg" alt="gojo" style={{marginTop:'0px'}} />
      </div>
    </div>
  );
}

export default Header;
