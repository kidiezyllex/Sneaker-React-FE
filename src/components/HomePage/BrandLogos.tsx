
const logos = [
  {
    name: 'Nike',
    url: 'https://logos-world.net/wp-content/uploads/2020/06/Nike-Logo.png',
  },
  {
    name: 'Adidas',
    url: 'https://logos-world.net/wp-content/uploads/2020/06/Adidas-Logo.png',
  },
  {
    name: 'Puma',
    url: 'https://logos-world.net/wp-content/uploads/2020/04/Puma-Logo.png',
  },
  {
    name: 'Reebok',
    url: 'https://logos-world.net/wp-content/uploads/2020/04/Reebok-Logo.png',
  },
  {
    name: 'New Balance',
    url: 'https://logos-world.net/wp-content/uploads/2020/09/New-Balance-Logo.png',
  },
  {
    name: 'Asics',
    url: 'https://logos-world.net/wp-content/uploads/2020/05/Asics-Logo.png',
  },
  {
    name: 'Under Armour',
    url: 'https://logos-world.net/wp-content/uploads/2020/04/Under-Armour-Logo.png',
  },
  {
    name: 'Vans',
    url: 'https://logos-world.net/wp-content/uploads/2020/06/Vans-Logo.png',
  },
  {
    name: 'Converse',
    url: 'https://logos-world.net/wp-content/uploads/2020/06/Converse-Logo.png',
  },
  {
    name: 'Fila',
    url: 'https://logos-world.net/wp-content/uploads/2020/09/Fila-Logo.png',
  },
  {
    name: 'Air Jordan',
    url: 'https://logos-world.net/wp-content/uploads/2020/04/Air-Jordan-Logo.png',
  },
];

export const BrandLogos = () => {
  return (
    <section className="py-12 pb-0 bg-gradient-to-br bg-white relative overflow-hidden">
      <h2 className="text-2xl font-bold text-center mb-8 relative">
        <span className="uppercase bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-sm ">
          Các thương hiệu sneaker bán chạy nhất
        </span>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
      </h2>
      <div className="container mx-auto relative z-10 mt-10">
        <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
          {/* First set of logos */}
          <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-logo-cloud">
            {logos.map((logo) => (
              <li key={logo.name} className="flex items-center justify-center w-[150px]">
                <img
                  draggable={false}
                  src={logo.url}
                  alt={logo.name}
                  width={1000}
                  height={1000}
                  className="max-h-44 h-16 object-contain select-none"
                />
              </li>
            ))}
          </ul>

          {/* Duplicate for seamless effect */}
          <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-logo-cloud" aria-hidden="true">
            {logos.map((logo) => (
              <li key={logo.name} className="flex items-center justify-center w-[150px]">
                <img
                  draggable={false}
                  src={logo.url}
                  alt={logo.name}
                  width={1000}
                  height={1000}
                  className="max-h-44 h-16 object-contain select-none"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default BrandLogos; 