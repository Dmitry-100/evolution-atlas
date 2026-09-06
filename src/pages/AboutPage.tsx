import { PageHeader } from "../components/ui/PageHeader";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import "../styles/pages/about.css";
import { Link } from "react-router-dom";
import { OptimizedImage } from "../components/ui/optimized-image";

export function AboutPage() {
  return (
    <section
      className="document-page about-page"
      data-tour-stop-id="page-about"
    >
      <PageHeader eyebrow="О проекте" title="Зачем нужен этот атлас">
        Атлас показывает путь от древних клеточных линий к человеку: когда
        расходились ветви родства и какие признаки мы унаследовали. У нас и
        современных обезьян общий предок. Разобраться в этом маршруте можно без
        биологической подготовки.
      </PageHeader>

      <p className="about-reading-note">
        <strong>Как читать Атлас.</strong> Выбирайте точки на шкале и изучайте
        изображения, признаки и источники. Точки обозначают группы и формы
        жизни, а не ступени совершенства.
      </p>

      <article
        className="about-origin-story"
        aria-labelledby="about-story-title"
      >
        <figure className="about-author">
          <OptimizedImage
            src="/assets/images/about/dmitry-sotnikov.jpg"
            alt="Сотников Дмитрий"
            loading="lazy"
            decoding="async"
          />
          <figcaption>Сотников Дмитрий</figcaption>
        </figure>

        <div className="about-origin-story__copy">
          <h2 id="about-story-title">Как появился проект</h2>
          <p className="about-origin-story__lead">
            Как с помощью ИИ за вечер погрузиться в любую тему — кейс “от архей
            до Homo sapiens”.
          </p>
          <p>
            В сентябре 2025 года я дочитывал книгу «Достающее звено» Станислава
            Дробышевского и поймал простую, но важную мысль: привычная
            “пирамида” эволюции с человеком на вершине обманчива. Если смотреть
            на историю жизни как на дерево, в основании оказываются древние
            клеточные линии, от которых разошлись ветви всех живых существ на
            Земле, а путь к человеку — только одна из множества ветвей.
          </p>
          <p>
            Картинка «от обезьяны к человеку» показывает лишь чуть больше 10
            миллионов лет эволюционной истории, которая началась более 3
            миллиардов лет назад. Мне стало любопытно: кто были наши предки и
            что мы унаследовали от каждого крупного этапа этого пути?
          </p>
          <p>
            Картинок в книгах обычно мало, поэтому я попросил GPT-5 Pro собрать
            простую интерактивную страницу: пройтись по генеалогическому
            маршруту Homo sapiens от древних клеточных форм до наших дней,
            показать изображения и коротко пояснить, что именно мы
            “унаследовали” на каждом этапе.{" "}
            <a
              href="https://quiet-bonbon-df1ea4.netlify.app/"
              target="_blank"
              rel="noreferrer"
            >
              Первый результат
            </a>{" "}
            сейчас уже выглядит скорее как черновик.
          </p>
          <p>
            Девять месяцев я не возвращался к этому мини-проекту, но с выходом
            Fable 5 решил обновить его. План пришлось собирать уже с помощью
            Codex/GPT-5.5, и страница постепенно превратилась в полноценный
            портал про эволюцию.
          </p>
          <p>
            Для меня это важная тема в контексте понимания, кто мы есть и почему
            все так устроено. А ещё пример того, как личное любопытство можно
            быстро превратить в аккуратный образовательный ресурс.
          </p>
          <footer className="about-actions">
            <Link className="button button-secondary button-md" to="/">
              Открыть Атлас <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link
              className="about-source-link"
              to="/sources"
              aria-label="Открыть источники"
            >
              Источники <ArrowUpRight aria-hidden="true" size={17} />
            </Link>
          </footer>
        </div>
      </article>
    </section>
  );
}
