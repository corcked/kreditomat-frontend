import Link from "next/link"
import { Facebook, Instagram, Send, Phone, Mail, MapPin } from "lucide-react"

const footerNavigation = {
  services: [
    { name: "Калькулятор займов", href: "/calculator" },
    { name: "Банковские предложения", href: "/offers" },
    { name: "Проверка ПДН", href: "/calculator#pdn" },
    { name: "Реферальная программа", href: "/referral" },
  ],
  support: [
    { name: "Как это работает", href: "/how-it-works" },
    { name: "Частые вопросы", href: "/faq" },
    { name: "Условия использования", href: "/terms" },
    { name: "Политика конфиденциальности", href: "/privacy" },
  ],
  company: [
    { name: "О нас", href: "/about" },
    { name: "Контакты", href: "/contacts" },
    { name: "Партнерам", href: "/partners" },
    { name: "Карьера", href: "/career" },
  ],
  social: [
    {
      name: "Facebook",
      href: "https://facebook.com/kreditomat",
      icon: Facebook,
    },
    {
      name: "Instagram",
      href: "https://instagram.com/kreditomat",
      icon: Instagram,
    },
    {
      name: "Telegram",
      href: "https://t.me/kreditomat",
      icon: Send,
    },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-gray-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Company Info */}
          <div className="space-y-8">
            <Link href="/" className="text-2xl font-bold text-white">
              Kreditomat
            </Link>
            <p className="text-sm leading-6 text-gray-300">
              Сервис-агрегатор микрозаймов в Узбекистане. Помогаем найти лучшие условия среди проверенных банков и МФО.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">+998 (71) 200-00-00</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">info@kreditomat.uz</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">Ташкент, ул. Амира Темура, 100</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-6">
              {footerNavigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-300"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">
                  Сервисы
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerNavigation.services.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">
                  Поддержка
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerNavigation.support.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">
                  Компания
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerNavigation.company.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <div className="text-center">
            <p className="text-xs leading-5 text-gray-400">
              &copy; {new Date().getFullYear()} Kreditomat. Все права защищены.
            </p>
            <p className="mt-2 text-xs leading-5 text-gray-400">
              Лицензия ЦБ РУз №123 от 01.01.2024. ОГРН: 1234567890123
            </p>
            <p className="mt-2 text-xs leading-5 text-gray-400">
              Сервис не является банком и не выдает займы. Мы помогаем подобрать оптимальные условия среди партнеров.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}