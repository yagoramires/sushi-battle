import FoodCard from './FoodCard';
import { useContext, useEffect, useState } from 'react';
import { QuantityContext } from '../context/QuantityContext';
import { MdKeyboardArrowDown } from 'react-icons/md';

const FoodList = () => {
  const [showCategory, setShowCategory] = useState({});

  const { foodList } = useContext(QuantityContext);
  const categories = new Set(foodList.map((food) => food.category));
  const categoryList = [...categories];

  const categoryCheck = (category) => {
    const filteredList = foodList.filter((food) => food.category === category);
    return filteredList.map((food) => <FoodCard key={food.id} food={food} />);
  };

  const hideCategoryHandler = (categoryId) => {
    const handler = [...showCategory];
    handler[categoryId] = {
      category: handler[categoryId].category,
      show: !handler[categoryId].show,
    };

    setShowCategory(handler);
  };

  useEffect(() => {
    const categoriesObject = [];

    categoryList.forEach((category) =>
      categoriesObject.push({ category: category, show: false }),
    );
    setShowCategory(categoriesObject);
  }, []);

  return (
    <ul className='flex flex-col flex-1 gap-2 mt-8  w-full max-w-[896px] mx-auto'>
      {categoryList?.map((category, index) => (
        <div key={index} className='flex flex-col mb-2 gap-[6px]'>
          <button className='flex justify-between items-center' onClick={() => hideCategoryHandler(index)}>
            <span className='font-bold text-xl'>{category}</span>
            <span>
              <MdKeyboardArrowDown
                size={20}
                className={`transition duration-200 ${
                  showCategory[index]?.category === category &&
                  showCategory[index]?.show
                    ? ' rotate-180'
                    : ''
                }`}
              />
            </span>
          </button>
          <ul
            className={`flex flex-col gap-2 ${
              showCategory[index]?.category === category &&
              showCategory[index]?.show
                ? ''
                : 'hidden'
            }`}
          >
            {categoryCheck(category)}
          </ul>
        </div>
      ))}
    </ul>
  );
};

export default FoodList;
