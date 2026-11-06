type HeaderProps = { title: string };

function Header({ title }: HeaderProps) {
  return <h1 className="header">{title}</h1>;
}
export default Header;