import { Link } from "react-router-dom";

const sections = [
  { id: "story", label: "Câu chuyện của chúng tôi" },
  { id: "mission", label: "Sứ mệnh & giá trị" },
  { id: "experience", label: "Trải nghiệm đặt lịch" },
  { id: "future", label: "Định hướng tương lai" },
];

export default function About() {
  return (
    <main className="about-blog">
      <div className="about-blog-shell">
        <nav className="about-breadcrumb" aria-label="breadcrumb">
          <Link to="/">Trang chủ</Link><span>/</span><span>Về chúng tôi</span>
        </nav>

        <header className="about-blog-hero">
          <div className="about-hero-copy">
            <span className="about-eyebrow"><span /> CÂU CHUYỆN BOOKING+</span>
            <h1>Chăm sóc bản thân,bắt đầu từ một lịch hẹn.</h1>
            <p className="about-hero-lead">
              Chúng tôi tin rằng trải nghiệm dịch vụ tốt nên bắt đầu từ những điều thật đơn giản:
              tìm hiểu dễ dàng, lựa chọn chủ động và đặt lịch thuận tiện.
            </p>
            <div className="about-author">
              <div className="about-author-mark">B+</div>
              <div><strong>Đội ngũ BOOKING+</strong><span>Nền tảng đặt lịch dịch vụ trực tuyến</span></div>
            </div>
            <Link className="about-primary-button" to="/booking">Khám phá dịch vụ <span>↗</span></Link>
          </div>
          <div className="about-hero-art">
            <img className="about-hero-image" src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1100&q=85" alt="Không gian salon hiện đại, ấm áp" />
            <div className="about-image-note"><span className="about-note-icon">✦</span><div><strong>Một trải nghiệm tốt hơn</strong><span>Bắt đầu từ sự chủ động</span></div></div>
            <span className="about-art-orbit" aria-hidden="true" />
          </div>
        </header>

        <div className="about-blog-layout">
          <aside className="about-contents">
            <span className="about-contents-title">TRONG BÀI VIẾT</span>
            {sections.map((section, index) => (
              <a key={section.id} href={`#${section.id}`}><span>0{index + 1}</span>{section.label}</a>
            ))}
            <div className="about-contents-cta">
              <span>✦</span>
              <p>Sẵn sàng cho trải nghiệm mới?</p>
              <Link to="/booking">Đặt lịch ngay →</Link>
            </div>
          </aside>

          <article className="about-article">
            <div className="about-article-intro">
              <span >VỀ CHÚNG TÔI · 4 PHÚT ĐỌC</span>
              <p >Trong nhịp sống bận rộn, dành thời gian chăm sóc bản thân đôi khi không dễ dàng. BOOKING+ được xây dựng với mong muốn giúp mỗi lịch hẹn trở nên nhẹ nhàng hơn — từ lúc tìm hiểu dịch vụ cho đến khi lựa chọn thời gian phù hợp.</p>
            </div>

            <section id="story" className="about-article-section">
              <span className="about-section-number">01 / CÂU CHUYỆN</span>
              <h2>Mọi trải nghiệm tốt đều bắt đầu từ sự thuận tiện</h2>
              <p>Chúng tôi nhận thấy việc đặt lịch đôi khi khiến khách hàng mất thời gian: cần hỏi thông tin dịch vụ, kiểm tra giá, liên hệ để chọn giờ hoặc xác nhận nhân viên. Với đơn vị cung cấp dịch vụ, việc sắp xếp lịch hẹn và theo dõi công việc cũng cần một quy trình rõ ràng.</p>
              <p>Vì vậy, BOOKING+ hướng đến một nơi mà khách hàng có thể chủ động tìm hiểu thông tin, lựa chọn dịch vụ, nhân viên và khung giờ phù hợp trên cùng một nền tảng. Mục tiêu của chúng tôi là làm cho công nghệ trở nên gần gũi, dễ dùng và thực sự hữu ích trong đời sống hằng ngày.</p>
              <figure className="about-article-figure">
                <img src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=85" alt="Nhân viên đang chăm sóc khách hàng tại salon" loading="lazy" />
                <figcaption>Một quy trình rõ ràng giúp khách hàng an tâm hơn trước mỗi lịch hẹn.</figcaption>
              </figure>
            </section>

            <section id="mission" className="about-article-section">
              <span className="about-section-number">02 / SỨ MỆNH & GIÁ TRỊ</span>
              <h2>Công nghệ hữu ích, trải nghiệm lấy khách hàng làm trung tâm</h2>
              <p>Sứ mệnh của BOOKING+ là đơn giản hóa việc đặt lịch và hỗ trợ cơ sở dịch vụ quản lý lịch hẹn hiệu quả hơn. Trong từng tính năng, chúng tôi hướng đến bốn giá trị cốt lõi:</p>
              <div className="about-value-list">
                <div className="about-value-item"><span className="about-value-icon">↗</span><div><h3>Thuận tiện</h3><p>Tìm hiểu dịch vụ và gửi yêu cầu đặt lịch qua vài thao tác đơn giản.</p></div></div>
                <div className="about-value-item"><span className="about-value-icon">◇</span><div><h3>Rõ ràng</h3><p>Thông tin dịch vụ, giá tham khảo và thời lượng được trình bày dễ theo dõi.</p></div></div>
                <div className="about-value-item"><span className="about-value-icon">♡</span><div><h3>Chủ động</h3><p>Khách hàng có thể lựa chọn nhân viên và khung giờ phù hợp với kế hoạch cá nhân.</p></div></div>
                <div className="about-value-item"><span className="about-value-icon">✳</span><div><h3>Kết nối</h3><p>Hỗ trợ khách hàng, nhân viên và người quản lý phối hợp thuận tiện hơn.</p></div></div>
              </div>
            </section>

            <section id="experience" className="about-article-section">
              <span className="about-section-number">03 / TRẢI NGHIỆM</span>
              <h2>Đặt lịch theo cách của bạn</h2>
              <p>Chúng tôi mong muốn quy trình đặt lịch rõ ràng từ đầu đến cuối, để khách hàng biết mình cần làm gì ở mỗi bước.</p>
              <div className="about-steps">
                <div><span>1</span><h3>Chọn dịch vụ</h3><p>Xem mô tả và lựa chọn dịch vụ phù hợp với nhu cầu.</p></div>
                <div><span>2</span><h3>Chọn lịch hẹn</h3><p>Lựa chọn nhân viên, ngày và khung giờ còn trống.</p></div>
                <div><span>3</span><h3>Thông tin liên hệ</h3><p>Điền thông tin cần thiết để cơ sở dịch vụ liên hệ.</p></div>
                <div><span>4</span><h3>Xác nhận</h3><p>Kiểm tra lại thông tin và hoàn tất các bước đặt lịch.</p></div>
              </div>
              <figure className="about-article-figure about-article-figure-short">
                <img src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=85" alt="Khoảnh khắc chăm sóc và làm đẹp" loading="lazy" />
                <figcaption>Thêm thời gian cho bản thân, bớt những bước chuẩn bị không cần thiết.</figcaption>
              </figure>
            </section>

            <section id="future" className="about-article-section">
              <span className="about-section-number">04 / ĐỊNH HƯỚNG</span>
              <h2>Không ngừng hoàn thiện mỗi ngày</h2>
              <p>BOOKING+ hướng đến việc tiếp tục cải thiện giao diện, hoàn thiện quy trình đặt lịch và phát triển thêm những công cụ hữu ích như đánh giá dịch vụ, quản lý lịch làm việc và theo dõi lịch hẹn. Chúng tôi xem mỗi góp ý của người dùng là cơ hội để làm sản phẩm tốt hơn.</p>
              <blockquote>“Một lịch hẹn dễ dàng là khởi đầu cho trải nghiệm chăm sóc bản thân trọn vẹn hơn.”</blockquote>
            </section>

            <section className="about-blog-end">
              <span>HẸN GẶP BẠN TẠI BOOKING+</span>
              <h1>Dành thời gian cho điều khiến bạn cảm thấy tốt hơn.</h1>
              <p>Khám phá các dịch vụ và chọn lịch hẹn phù hợp với bạn ngay hôm nay.</p>
              <Link to="/booking" className="about-primary-button">Bắt đầu đặt lịch <span>→</span></Link>
            </section>
          </article>
        </div>
      </div>
    </main>
  );
}
