import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Calculator, Shield, Clock, TrendingUp } from "lucide-react"

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Микрозаймы онлайн за 5 минут
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Сравните предложения от ведущих банков и МФО Узбекистана. 
              Получите деньги на карту без посещения офиса.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" asChild>
                <Link href="/calculator">Рассчитать займ</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/offers">Все предложения</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Почему выбирают Kreditomat
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Мы делаем процесс получения займа простым и прозрачным
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
              <Card className="p-6">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  Умный калькулятор
                </dt>
                <dd className="mt-1 text-base leading-7 text-gray-600">
                  Расчет ПДН с автокоррекцией. Подберем оптимальные параметры займа под ваш доход.
                </dd>
              </Card>
              
              <Card className="p-6">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  Проверенные партнеры
                </dt>
                <dd className="mt-1 text-base leading-7 text-gray-600">
                  Только лицензированные банки и МФО. Прозрачные условия без скрытых комиссий.
                </dd>
              </Card>
              
              <Card className="p-6">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  Быстрое решение
                </dt>
                <dd className="mt-1 text-base leading-7 text-gray-600">
                  Заполните заявку за 5 минут. Решение по займу в течение 15 минут.
                </dd>
              </Card>
              
              <Card className="p-6">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  Лучшие условия
                </dt>
                <dd className="mt-1 text-base leading-7 text-gray-600">
                  Сравнение всех предложений в одном месте. Выберите самую низкую ставку.
                </dd>
              </Card>
            </dl>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Готовы получить займ?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-foreground/90">
              Заполните заявку прямо сейчас и получите деньги на карту уже сегодня
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/register">Начать оформление</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20" asChild>
                <Link href="/how-it-works">Как это работает</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}