import { useCallback, useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || '/api/foods'

const emptyForm = {
  name: '',
  category: '',
  cuisine: '',
  ingredients: '',
  price: '',
  quantity: '',
  description: '',
  imageUrl: '',
}

async function request(url, options) {
  const response = await fetch(url, options)
  const result = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(result?.message || `Yêu cầu thất bại (${response.status})`)
  }

  return result
}

async function fetchFoods(query = '') {
  const url = query
    ? `${API_URL}/search?q=${encodeURIComponent(query)}`
    : API_URL
  const result = await request(url)
  return result.data || []
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price)
}

function getFoodIdentifier(food) {
  return food._id || food.foodId
}

function FoodForm({ food, saving, onClose, onSubmit }) {
  const [form, setForm] = useState(() => (
    food
      ? {
          name: food.name || '',
          category: food.category || '',
          cuisine: food.cuisine || '',
          ingredients: (food.ingredients || []).join(', '),
          price: food.price ?? '',
          quantity: food.quantity ?? '',
          description: food.description || '',
          imageUrl: food.imageUrl || '',
        }
      : emptyForm
  ))

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({
      ...form,
      ingredients: form.ingredients
        .split(',')
        .map((ingredient) => ingredient.trim())
        .filter(Boolean),
      price: Number(form.price),
      quantity: Number(form.quantity),
    })
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !saving) onClose()
    }}>
      <section
        aria-labelledby="food-form-title"
        aria-modal="true"
        className="modal form-modal"
        role="dialog"
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">{food ? 'CẬP NHẬT THÔNG TIN' : 'THÊM VÀO THỰC ĐƠN'}</p>
            <h2 id="food-form-title">{food ? 'Sửa món ăn' : 'Thêm món ăn mới'}</h2>
          </div>
          <button aria-label="Đóng" className="icon-button" disabled={saving} onClick={onClose} type="button">
            ×
          </button>
        </div>

        <form className="food-form" onSubmit={handleSubmit}>
          <label>
            Tên món ăn <span>*</span>
            <input autoFocus maxLength="120" name="name" onChange={updateField} required value={form.name} />
          </label>
          <div className="form-row">
            <label>
              Danh mục <span>*</span>
              <input maxLength="80" name="category" onChange={updateField} required value={form.category} />
            </label>
            <label>
              Ẩm thực
              <input maxLength="80" name="cuisine" onChange={updateField} value={form.cuisine} />
            </label>
          </div>
          <label>
            Nguyên liệu <span className="optional">(phân cách bằng dấu phẩy)</span>
            <input
              name="ingredients"
              onChange={updateField}
              placeholder="Ví dụ: bánh phở, thịt bò, hành"
              value={form.ingredients}
            />
          </label>
          <div className="form-row">
            <label>
              Giá bán (₫) <span>*</span>
              <input min="0" name="price" onChange={updateField} required type="number" value={form.price} />
            </label>
            <label>
              Số lượng <span>*</span>
              <input min="0" name="quantity" onChange={updateField} required type="number" value={form.quantity} />
            </label>
          </div>
          <label>
            Đường dẫn hình ảnh
            <input name="imageUrl" onChange={updateField} placeholder="https://..." type="url" value={form.imageUrl} />
          </label>
          <label>
            Mô tả
            <textarea maxLength="500" name="description" onChange={updateField} rows="3" value={form.description} />
          </label>
          <div className="modal-actions">
            <button className="button button-secondary" disabled={saving} onClick={onClose} type="button">Hủy</button>
            <button className="button button-primary" disabled={saving} type="submit">
              {saving ? <><span className="spinner" /> Đang lưu...</> : food ? 'Lưu thay đổi' : 'Tạo món ăn'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function FoodDetails({ food, onClose, onEdit }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section
        aria-labelledby="food-details-title"
        aria-modal="true"
        className="modal details-modal"
        role="dialog"
      >
        <button aria-label="Đóng" className="icon-button details-close" onClick={onClose} type="button">×</button>
        {food.imageUrl ? (
          <img alt={food.name} className="details-image" src={food.imageUrl} />
        ) : (
          <div aria-hidden="true" className="details-image image-placeholder">🍜</div>
        )}
        <div className="details-content">
          <p className="eyebrow">{food.category || 'MÓN ĂN'}{food.cuisine ? ` · ${food.cuisine}` : ''}</p>
          <h2 id="food-details-title">{food.name}</h2>
          <p className="details-price">{formatPrice(food.price)}</p>
          {food.description && <p className="details-description">{food.description}</p>}
          <div className="detail-meta">
            <div><span>Mã món</span><strong>{food.foodId || '—'}</strong></div>
            <div><span>Số lượng</span><strong>{food.quantity ?? 0}</strong></div>
          </div>
          <div className="ingredients-block">
            <span>Nguyên liệu</span>
            {food.ingredients?.length ? (
              <div className="tag-list">
                {food.ingredients.map((ingredient) => <span className="tag" key={ingredient}>{ingredient}</span>)}
              </div>
            ) : <p className="muted">Chưa có thông tin nguyên liệu.</p>}
          </div>
          <div className="modal-actions">
            <button className="button button-secondary" onClick={onClose} type="button">Đóng</button>
            <button className="button button-primary" onClick={onEdit} type="button">Sửa món ăn</button>
          </div>
        </div>
      </section>
    </div>
  )
}

function App() {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [modal, setModal] = useState(null)

  const loadFoods = useCallback(async (query = '') => {
    setLoading(true)
    try {
      setFoods(await fetchFoods(query))
      return true
    } catch (error) {
      setToast({ type: 'error', message: `Không tải được danh sách món ăn: ${error.message}` })
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchFoods()
      .then((result) => {
        if (!cancelled) setFoods(result)
      })
      .catch((error) => {
        if (!cancelled) {
          setToast({ type: 'error', message: `Không tải được danh sách món ăn: ${error.message}` })
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    if (toast.type === 'loading') return undefined
    const timeoutId = window.setTimeout(() => setToast(null), 4200)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  async function handleSearch(event) {
    event.preventDefault()
    const query = searchInput.trim()
    setActiveSearch(query)
    await loadFoods(query)
  }

  async function handleSave(foodData) {
    setSaving(true)
    setToast({ type: 'loading', message: modal.food ? 'Đang cập nhật món ăn...' : 'Đang thêm món ăn...' })
    try {
      const isEditing = Boolean(modal.food)
      const endpoint = isEditing
        ? `${API_URL}/${encodeURIComponent(getFoodIdentifier(modal.food))}`
        : API_URL
      await request(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodData),
      })
      setModal(null)
      setToast({ type: 'success', message: isEditing ? 'Cập nhật món ăn thành công.' : 'Thêm món ăn thành công.' })
      await loadFoods(activeSearch)
    } catch (error) {
      setToast({ type: 'error', message: `Không lưu được món ăn: ${error.message}` })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(food) {
    if (!window.confirm(`Bạn có chắc muốn xóa "${food.name}" không?`)) return

    const id = getFoodIdentifier(food)
    setDeletingId(id)
    setToast({ type: 'loading', message: 'Đang xóa món ăn...' })
    try {
      await request(`${API_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' })
      setToast({ type: 'success', message: 'Đã xóa món ăn.' })
      await loadFoods(activeSearch)
    } catch (error) {
      setToast({ type: 'error', message: `Không xóa được món ăn: ${error.message}` })
    } finally {
      setDeletingId(null)
    }
  }

  function editFood(food) {
    setModal({ type: 'form', food })
  }

  const isMutating = Boolean(saving || deletingId)

  return (
    <main className="page-shell">
      <header className="topbar">
        <a aria-label="Bếp Nhà, trang chủ" className="brand" href="/">
          <span aria-hidden="true" className="brand-mark">B</span>
          <span>236356_TranThienHung<span className="brand-dot">.</span></span>
        </a>
        <span className="topbar-label"><span className="status-dot" /> QUẢN LÝ THỰC ĐƠN</span>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">GÓC BẾP CỦA BẠN</p>
          <h1>Món ngon mỗi ngày<span>.</span></h1>
          <p className="hero-description">Quản lý thực đơn và theo dõi các món ăn của bạn ở một nơi.</p>
        </div>
        <div aria-hidden="true" className="hero-art">
          <span className="hero-art-plate">🍲</span>
          <span className="hero-art-sparkle sparkle-one">✳</span>
          <span className="hero-art-sparkle sparkle-two">✦</span>
        </div>
      </section>

      <section aria-label="Danh sách món ăn" className="menu-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THỰC ĐƠN</p>
            <h2>Món ăn <span className="count-badge">{foods.length}</span></h2>
          </div>
          <button className="button button-primary add-button" disabled={isMutating} onClick={() => setModal({ type: 'form', food: null })} type="button">
            <span aria-hidden="true">＋</span> Thêm món ăn
          </button>
        </div>

        <form className="search-bar" onSubmit={handleSearch}>
          <span aria-hidden="true" className="search-icon">⌕</span>
          <input
            aria-label="Tìm món ăn"
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Tìm theo tên, mã món, danh mục, nguyên liệu..."
            value={searchInput}
          />
          {searchInput && (
            <button aria-label="Xóa từ khóa" className="clear-search" onClick={() => {
              setSearchInput('')
              setActiveSearch('')
              loadFoods('')
            }} type="button">×</button>
          )}
          <button className="search-button" disabled={loading} type="submit">Tìm kiếm</button>
        </form>

        {loading ? (
          <div aria-live="polite" className="loading-state">
            <span className="spinner spinner-dark" />
            <span>Đang tải thực đơn...</span>
          </div>
        ) : foods.length === 0 ? (
          <div className="empty-state">
            <span aria-hidden="true" className="empty-illustration">{activeSearch ? '⌕' : '🍽️'}</span>
            <h3>{activeSearch ? 'Không tìm thấy món ăn' : 'Thực đơn còn trống'}</h3>
            <p>{activeSearch ? 'Thử từ khóa khác hoặc xóa tìm kiếm.' : 'Thêm món ăn đầu tiên để bắt đầu quản lý thực đơn.'}</p>
            {activeSearch ? (
              <button className="button button-secondary" onClick={() => {
                setSearchInput('')
                setActiveSearch('')
                loadFoods('')
              }} type="button">Xóa tìm kiếm</button>
            ) : (
              <button className="button button-primary" onClick={() => setModal({ type: 'form', food: null })} type="button">Thêm món đầu tiên</button>
            )}
          </div>
        ) : (
          <div className="food-grid">
            {foods.map((food) => {
              const id = getFoodIdentifier(food)
              return (
                <article className="food-card" key={id}>
                  <button className="food-image-button" onClick={() => setModal({ type: 'details', food })} type="button">
                    {food.imageUrl ? (
                      <img alt="" className="food-image" loading="lazy" src={food.imageUrl} />
                    ) : (
                      <span aria-hidden="true" className="food-image image-placeholder">🍜</span>
                    )}
                    <span className="category-pill">{food.category}</span>
                  </button>
                  <div className="food-card-content">
                    <div className="food-card-title-row">
                      <div>
                        <h3>{food.name}</h3>
                        <p className="food-cuisine">{food.cuisine || 'Món ăn'}</p>
                      </div>
                      <strong className="food-price">{formatPrice(food.price)}</strong>
                    </div>
                    {food.description && <p className="food-description">{food.description}</p>}
                    <div className="food-card-footer">
                      <span className="stock-label">Còn <strong>{food.quantity ?? 0}</strong></span>
                      <div className="card-actions">
                        <button aria-label={`Xem chi tiết ${food.name}`} className="text-button" onClick={() => setModal({ type: 'details', food })} type="button">Chi tiết</button>
                        <button aria-label={`Sửa ${food.name}`} className="small-icon-button" disabled={isMutating} onClick={() => editFood(food)} type="button">✎</button>
                        <button
                          aria-label={`Xóa ${food.name}`}
                          className="small-icon-button delete-button"
                          disabled={isMutating}
                          onClick={() => handleDelete(food)}
                          type="button"
                        >{deletingId === id ? <span className="spinner spinner-dark" /> : '⌫'}</button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {toast && (
        <div aria-live={toast.type === 'error' ? 'assertive' : 'polite'} className={`toast toast-${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
          <span aria-hidden="true" className="toast-icon">
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '!' : <span className="spinner" />}
          </span>
          <span>{toast.message}</span>
          <button aria-label="Đóng thông báo" className="toast-close" onClick={() => setToast(null)} type="button">×</button>
        </div>
      )}

      {modal?.type === 'form' && (
        <FoodForm food={modal.food} onClose={() => {
          if (!saving) setModal(null)
        }} onSubmit={handleSave} saving={saving} />
      )}
      {modal?.type === 'details' && (
        <FoodDetails
          food={modal.food}
          onClose={() => setModal(null)}
          onEdit={() => editFood(modal.food)}
        />
      )}
    </main>
  )
}

export default App
