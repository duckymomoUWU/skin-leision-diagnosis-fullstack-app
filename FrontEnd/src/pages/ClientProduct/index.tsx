import { useState, useEffect } from "react";
import "./style.scss";
import ProductCard from "../../components/client/ProductCard";
import axiosInstance from "../../api/Axios";

type Product = {
    id: number;
    product_id: string;
    title: string;
    description: string;
    image: string;
    price: number;
    availability: boolean;
    sold_count: number;
    createdAt: string;
    updatedAt: string;
};


const ClientProduct = () => {
    const [data, setData] = useState<Product[]>([]);

    useEffect(() => {
        axiosInstance.get("/product")
            .then(res => {
                setData(res.data)
            })
            .catch(err => console.error("Failed to fetch products", err));
    }, [])

    const [openFilter, setOpenFilter] = useState(false);
    const ALL_CATEGORY = "All";
    const [filterSelected, setFilterSelected] = useState(ALL_CATEGORY)

    const [openSort, setOpenSort] = useState(false);
    const [sortSelected, setSortSelected] = useState("Giá tăng dần")
    const [relatedProductIds, setRelatedProductIds] = useState<string[]>([]);


    const categories = [
        ALL_CATEGORY,
        "nv",      // Melanocytic nevi
        "mel",     // Melanoma
        "bkl",     // Benign keratosis-like lesions
        "bcc",     // Basal cell carcinoma
        "akiec",   // Actinic keratoses
        "vasc",    // Vascular lesions
        "df"       // Dermatofibroma
    ];

    const sorts = [
        "Giá tăng dần",
        "Giá giảm dần",
    ]

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;


    // Fetch related products
    useEffect(() => {
        if (filterSelected === ALL_CATEGORY) {
            setRelatedProductIds([]);
        } else {
            axiosInstance.get(`/skin-leision/by-name/${filterSelected}`)
                .then(res => {
                    setRelatedProductIds(res.data.relatedProductIds || []);
                })
                .catch(() => setRelatedProductIds([]));
        }
    }, [filterSelected]);


    const filteredAndSortedData = data
    .filter((item) => {
        if (filterSelected === ALL_CATEGORY) return true;
        return relatedProductIds.includes(item.product_id);
    })
    
    .sort((a, b) => {
        if (sortSelected === "Giá tăng dần") return a.price - b.price;
        if (sortSelected === "Giá giảm dần") return b.price - a.price;
        return 0;
    });

    const currentItems = filteredAndSortedData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);


    return (
        <>
            <div className="product_container">
                <h2>Product List</h2>
                <div className="controls">
                    <div className="controls__search">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <input type="text" placeholder="Search products..." />
                    </div>
                    <div className="controls__filter">
                        <div className="controls__filter__selected" onClick={()=> {setOpenFilter(!openFilter); setOpenSort(false)}}>
                            <p>{filterSelected}</p>
                            <i className="fa-solid fa-filter"></i>
                        </div>
                        {
                            openFilter && <ul>
                                {categories.map((cat) => (
                                    <li key={cat} onClick={() => {setFilterSelected(cat); setOpenFilter(false);}}>
                                        <div>
                                            {(filterSelected === cat) && <i className="fa-solid fa-check"></i> }
                                        </div>
                                        <p>{cat}</p>
                                    </li>
                                ))}
                        </ul>
                        }
                    </div>
                    <div className="controls__sort">
                        <div className="controls__sort__selected" onClick={()=> {setOpenSort(!openSort); setOpenFilter(false)}}>
                            <p>{sortSelected}</p>
                            <i className="fa-solid fa-filter"></i>
                        </div>
                        {
                            openSort && <ul>
                                {sorts.map((cat) => (
                                    <li key={cat} onClick={() => {setSortSelected(cat); setOpenSort(false);}}>
                                        <div>
                                            {(sortSelected === cat) && <i className="fa-solid fa-check"></i> }
                                        </div>
                                        <p>{cat}</p>
                                    </li>
                                ))}
                        </ul>
                        }
                    </div>
                </div>
                <div className="product__list">
                    {currentItems.map((product) => (
                        <ProductCard
                        key={product.id}
                        id={product.id.toString()}
                        image={product.image}
                        title={product.title}
                        price={product.price}
                        description={product.description}
                        />
                    ))}
                </div>

                <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                        key={page}
                        className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                        >
                        {page}
                        </button>
                    ))}
                </div>



            </div>
        </>
    );
};

export default ClientProduct;
