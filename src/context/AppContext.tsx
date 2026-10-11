import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useNotification } from "./NotificationContext";
import { apiFetch } from "../lib/api";
import {
  Animal,
  Case,
  ClinicalEntry,
  Medicine,
  Donation,
  AdoptionApplication,
  Adoption,
  ABCRecord,
  WildlifeCase,
  Declaration,
  HousekeepingSupply,
  MedicineUsage,
  StaffMember,
  InventoryItem,
  UserProfile,
} from "../types";

interface AppContextType {
  animals: Animal[];
  cases: Case[];
  clinicalEntries: ClinicalEntry[];
  wildlifeCases: WildlifeCase[];
  declarations: Declaration[];
  medicines: Medicine[];
  donations: Donation[];
  adoptions: Adoption[];
  adoptionApplications: AdoptionApplication[];
  abcRecords: ABCRecord[];
  housekeepingSupplies: HousekeepingSupply[];
  inventoryItems: InventoryItem[];
  medicineUsage: MedicineUsage[];
  staff: StaffMember[];
  userProfiles: UserProfile[];
  lowStockMedicines: Medicine[];
  isLoading: boolean;

  // Actions
  addAnimal: (animal: Animal) => void;
  updateAnimal: (animal: Animal) => void;
  addCase: (newCase: Case) => void;
  updateCase: (updatedCase: Case) => Promise<void>;
  addClinicalEntry: (entry: ClinicalEntry) => void;
  updateClinicalEntry: (entry: ClinicalEntry) => void;
  addWildlifeCase: (newCase: WildlifeCase) => void;
  addDeclaration: (record: Declaration) => void;
  updateDeclaration: (record: Declaration) => void;
  addMedicine: (newMed: Medicine) => void;
  updateMedicineQuantity: (id: string, newQuantity: number) => void;
  deleteMedicine: (id: string) => void;
  deleteDonation: (id: string) => void;
  deleteAdoption: (id: string) => void;
  deleteAdoptionApplication: (id: string) => void;
  deleteABCRecord: (id: string) => void;
  deleteHousekeepingSupply: (id: string) => void;
  deleteInventoryItem: (id: string) => void;
  deleteMedicineUsage: (id: string) => void;
  deleteStaff: (id: string) => void;
  deleteAnimal: (id: string) => void;
  deleteCase: (id: string) => Promise<boolean>;
  deleteClinicalEntry: (id: string) => Promise<boolean>;
  deleteDeclaration: (id: string) => void;
  addDonation: (donation: Donation) => void;
  addAdoption: (adoption: Adoption) => void;
  addAdoptionApplication: (application: AdoptionApplication) => void;
  updateAdoptionApplication: (application: AdoptionApplication) => Promise<AdoptionApplication | null>;
  addABCRecord: (record: ABCRecord) => void;
  updateABCRecord: (record: ABCRecord) => void;
  addHousekeepingSupply: (supply: HousekeepingSupply) => void;
  updateHousekeepingSupply: (supply: HousekeepingSupply) => void;
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  addMedicineUsage: (usage: MedicineUsage) => void;
  addStaff: (member: StaffMember) => void;
  updateStaff: (member: StaffMember) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{
  children: ReactNode;
  enabled?: boolean;
  userRole?: string;
}> = ({ children, enabled = true, userRole }) => {
  const { notify } = useNotification();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [clinicalEntries, setClinicalEntries] = useState<ClinicalEntry[]>([]);
  const [wildlifeCases, setWildlifeCases] = useState<WildlifeCase[]>([]);
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [adoptionApplications, setAdoptionApplications] = useState<
    AdoptionApplication[]
  >([]);
  const [abcRecords, setAbcRecords] = useState<ABCRecord[]>([]);
  const [housekeepingSupplies, setHousekeepingSupplies] = useState<
    HousekeepingSupply[]
  >([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [medicineUsage, setMedicineUsage] = useState<MedicineUsage[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const lowStockMedicines = medicines.filter(
    (m) => m.quantity <= m.minStockLevel,
  );

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const fetchOrEmpty = (path: string, allowedRoles: string[]) =>
      allowedRoles.includes(userRole ?? '')
        ? apiFetch(path)
        : Promise.resolve(new Response('[]', { status: 200 }));

    const fetchData = async () => {
      try {
        const [
          animalsRes,
          wildlifeRes,
          staffRes,
          medsRes,
          houseRes,
          donationsRes,
          appsRes,
          entriesRes,
          abcRes,
          declRes,
          usageRes,
          itemsRes,
          adoptionsRes,
          usersRes,
        ] = await Promise.all([
          fetchOrEmpty("/api/animals", ["Admin", "Doctor"]),
          // fetch('/api/cases'), // Remove global fetch to save bandwidth
          fetchOrEmpty("/api/wildlife", ["Admin", "Doctor", "Data Entry"]),
          fetchOrEmpty("/api/staff", ["Admin"]),
          fetchOrEmpty("/api/inventory/medicines", ["Admin", "Doctor", "Data Entry"]),
          fetchOrEmpty("/api/inventory/housekeeping", ["Admin", "Data Entry"]),
          fetchOrEmpty("/api/donations", ["Admin"]),
          fetchOrEmpty("/api/adoptions/applications", ["Admin"]),
          fetchOrEmpty("/api/clinical-entries", ["Admin", "Doctor"]),
          fetchOrEmpty("/api/abc-records", ["Admin", "Doctor", "Data Entry"]),
          fetchOrEmpty("/api/declarations", ["Admin", "Data Entry"]),
          fetchOrEmpty("/api/medicine-usages", ["Admin", "Doctor", "Data Entry"]),
          fetchOrEmpty("/api/inventory/items", ["Admin", "Doctor", "Data Entry"]),
          fetchOrEmpty("/api/adoptions", ["Admin"]),
          fetchOrEmpty("/api/users", ["Admin"]),
        ]);

        if (animalsRes.ok) setAnimals(await animalsRes.json());
        // if (casesRes.ok) setCases(await casesRes.json());
        if (wildlifeRes.ok) setWildlifeCases(await wildlifeRes.json());
        if (staffRes.ok) setStaff(await staffRes.json());
        if (medsRes.ok) setMedicines(await medsRes.json());
        if (houseRes.ok) setHousekeepingSupplies(await houseRes.json());
        if (donationsRes.ok) setDonations(await donationsRes.json());
        if (appsRes.ok) setAdoptionApplications(await appsRes.json());
        if (entriesRes.ok) setClinicalEntries(await entriesRes.json());
        if (abcRes.ok) setAbcRecords(await abcRes.json());
        if (declRes.ok) setDeclarations(await declRes.json());
        if (usageRes.ok) setMedicineUsage(await usageRes.json());
        if (itemsRes.ok) setInventoryItems(await itemsRes.json());
        if (adoptionsRes.ok) setAdoptions(await adoptionsRes.json());
        if (usersRes.ok) setUserProfiles(await usersRes.json());
      } catch (err) {
        console.error("Failed to load data from backend:", err);
        notify(
          "Failed to sync data with server. Working in offline mode.",
          "error",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [enabled, notify, userRole]);

  const handleRequest = useCallback(
    async (
      apiPath: string,
      options: RequestInit,
      successMessage?: string,
      onSuccess?: (data: any) => void,
    ) => {
      try {
        const response = await apiFetch(apiPath, options);

        if (response.status === 204) {
          if (successMessage) notify(successMessage, "success");
          if (onSuccess) onSuccess(null);
          return true;
        }

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          notify(data.error || "Operation failed", "error");
          return null;
        }

        const data = await response.json();

        if (successMessage) notify(successMessage, "success");
        if (onSuccess) onSuccess(data);
        return data;
      } catch (err) {
        notify("Network error. Check your connection.", "error");
        console.error(err);
        return null;
      }
    },
    [notify],
  );

  const addAnimal = async (animal: Animal) => {
    const { id, ...data } = animal;
    await handleRequest(
      "/api/animals",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      "Animal added",
      (saved) => setAnimals((prev) => [saved, ...prev]),
    );
  };

  const updateAnimal = async (animal: Animal) => {
    await handleRequest(
      `/api/animals/${animal.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(animal),
      },
      "Animal updated",
      (saved) =>
        setAnimals((prev) => prev.map((a) => (a.id === saved.id ? saved : a))),
    );
  };

  const deleteAnimal = async (id: string) => {
    await handleRequest(
      `/api/animals/${id}`,
      { method: "DELETE" },
      "Animal removed",
      () => setAnimals((prev) => prev.filter((a) => a.id !== id)),
    );
  };

  const addCase = async (newCase: Case) => {
    const { id, ...data } = newCase;
    await handleRequest(
      "/api/cases",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      "Case created",
      (saved) => setCases((prev) => [saved, ...prev]),
    );
  };

  const updateCase = async (updatedCase: Case) => {
    await handleRequest(
      `/api/cases/${updatedCase.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCase),
      },
      "Case updated",
      (saved) =>
        setCases((prev) => prev.map((c) => (c.id === saved.id ? saved : c))),
    );
  };

  const deleteCase = async (id: string) => {
    const result = await handleRequest(
      `/api/cases/${id}`,
      { method: "DELETE" },
      "Case removed",
      () => setCases((prev) => prev.filter((c) => c.id !== id)),
    );
    return result !== null;
  };

  const addClinicalEntry = async (entry: ClinicalEntry) => {
    const { id, ...data } = entry;
    await handleRequest(
      "/api/clinical-entries",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      "Entry captured",
      (saved) => setClinicalEntries((prev) => [saved, ...prev]),
    );
  };

  const updateClinicalEntry = async (entry: ClinicalEntry) => {
    await handleRequest(
      `/api/clinical-entries/${entry.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      },
      "Entry updated",
      (saved) =>
        setClinicalEntries((prev) =>
          prev.map((c) => (c.id === saved.id ? saved : c)),
        ),
    );
  };

  const deleteClinicalEntry = async (id: string) => {
    const result = await handleRequest(
      `/api/clinical-entries/${id}`,
      { method: "DELETE" },
      "Entry removed",
      () => setClinicalEntries((prev) => prev.filter((c) => c.id !== id)),
    );
    return result !== null;
  };

  const addWildlifeCase = async (newCase: WildlifeCase) => {
    const { id, ...data } = newCase;
    await handleRequest(
      "/api/wildlife",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      "Wildlife rescue added",
      (saved) => setWildlifeCases((prev) => [saved, ...prev]),
    );
  };

  const deleteWildlifeCase = async (id: string) => {
    await handleRequest(
      `/api/wildlife/${id}`,
      { method: "DELETE" },
      "Case removed",
      () => setWildlifeCases((prev) => prev.filter((w) => w.id !== id)),
    );
  };

  const addDeclaration = async (record: Declaration) => {
    const { id, ...data } = record;
    await handleRequest(
      "/api/declarations",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      "Declaration saved",
      (saved) => setDeclarations((prev) => [saved, ...prev]),
    );
  };

  const updateDeclaration = async (record: Declaration) => {
    await handleRequest(
      `/api/declarations/${record.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      },
      "Declaration updated",
      (saved) =>
        setDeclarations((prev) =>
          prev.map((d) => (d.id === saved.id ? saved : d)),
        ),
    );
  };

  const deleteDeclaration = async (id: string) => {
    await handleRequest(
      `/api/declarations/${id}`,
      { method: "DELETE" },
      "Declaration removed",
      () => setDeclarations((prev) => prev.filter((d) => d.id !== id)),
    );
  };

  const addMedicine = async (newMed: Medicine) => {
    const { id, ...data } = newMed;
    await handleRequest(
      "/api/inventory/medicines",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      "Medicine added",
      (saved) => setMedicines((prev) => [saved, ...prev]),
    );
  };

  const updateMedicineQuantity = async (id: string, newQuantity: number) => {
    await handleRequest(
      `/api/inventory/medicines/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      },
      "Stock updated",
      () =>
        setMedicines((prev) =>
          prev.map((m) => (m.id === id ? { ...m, quantity: newQuantity } : m)),
        ),
    );
  };

  const deleteMedicine = async (id: string) => {
    await handleRequest(
      `/api/inventory/medicines/${id}`,
      { method: "DELETE" },
      "Medicine removed",
      () => setMedicines((prev) => prev.filter((m) => m.id !== id)),
    );
  };

  const addDonation = async (donation: Donation) => {
    const { id, ...data } = donation;
    await handleRequest(
      "/api/donations",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      "Donation recorded",
      (saved) => setDonations((prev) => [saved, ...prev]),
    );
  };

  const deleteDonation = async (id: string) => {
    await handleRequest(
      `/api/donations/${id}`,
      { method: "DELETE" },
      "Donation removed",
      () => setDonations((prev) => prev.filter((d) => d.id !== id)),
    );
  };

  const addAdoption = async (adoption: Adoption) => {
    const { id, ...data } = adoption;
    await handleRequest(
      "/api/adoptions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      "Adoption processed",
      (saved) => setAdoptions((prev) => [saved, ...prev]),
    );
  };

  const deleteAdoption = async (id: string) => {
    await handleRequest(
      `/api/adoptions/${id}`,
      { method: "DELETE" },
      "Adoption deleted",
      () => setAdoptions((prev) => prev.filter((a) => a.id !== id)),
    );
  };

  const addAdoptionApplication = async (application: AdoptionApplication) => {
    const { id, ...data } = application;
    await handleRequest(
      "/api/adoptions/applications",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      "Application submitted",
      (saved) => setAdoptionApplications((prev) => [saved, ...prev]),
    );
  };

  const updateAdoptionApplication = async (
    application: AdoptionApplication,
  ) => {
    return await handleRequest(
      `/api/adoptions/applications/${application.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(application),
      },
      "Application updated",
      (saved) =>
        setAdoptionApplications((prev) =>
          prev.map((a) => (a.id === saved.id ? saved : a)),
        ),
    ) as AdoptionApplication | null;
  };

  const deleteAdoptionApplication = async (id: string) => {
    await handleRequest(
      `/api/adoptions/applications/${id}`,
      { method: "DELETE" },
      "Application removed",
      () => setAdoptionApplications((prev) => prev.filter((a) => a.id !== id)),
    );
  };

  const addABCRecord = async (record: ABCRecord) => {
    const { id, ...data } = record;
    await handleRequest(
      "/api/abc-records",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      "ABC record added",
      (saved) => setAbcRecords((prev) => [saved, ...prev]),
    );
  };

  const updateABCRecord = async (record: ABCRecord) => {
    await handleRequest(
      `/api/abc-records/${record.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      },
      "ABC record updated",
      (saved) =>
        setAbcRecords((prev) =>
          prev.map((a) => (a.id === saved.id ? saved : a)),
        ),
    );
  };

  const deleteABCRecord = async (id: string) => {
    await handleRequest(
      `/api/abc-records/${id}`,
      { method: "DELETE" },
      "ABC record removed",
      () => setAbcRecords((prev) => prev.filter((a) => a.id !== id)),
    );
  };

  const addHousekeepingSupply = async (supply: HousekeepingSupply) => {
    const { id, ...data } = supply;
    await handleRequest(
      "/api/inventory/housekeeping",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      "Supply added",
      (saved) => setHousekeepingSupplies((prev) => [saved, ...prev]),
    );
  };

  const updateHousekeepingSupply = async (supply: HousekeepingSupply) => {
    await handleRequest(
      `/api/inventory/housekeeping/${supply.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supply),
      },
      "Supply updated",
      (saved) =>
        setHousekeepingSupplies((prev) =>
          prev.map((h) => (h.id === saved.id ? saved : h)),
        ),
    );
  };

  const deleteHousekeepingSupply = async (id: string) => {
    await handleRequest(
      `/api/inventory/housekeeping/${id}`,
      { method: "DELETE" },
      "Supply removed",
      () => setHousekeepingSupplies((prev) => prev.filter((h) => h.id !== id)),
    );
  };

  const addInventoryItem = async (item: InventoryItem) => {
    const { id, ...data } = item;
    await handleRequest(
      "/api/inventory/items",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      "Item added",
      (saved) => setInventoryItems((prev) => [saved, ...prev]),
    );
  };

  const updateInventoryItem = async (item: InventoryItem) => {
    await handleRequest(
      `/api/inventory/items/${item.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      },
      "Item updated",
      (saved) =>
        setInventoryItems((prev) =>
          prev.map((i) => (i.id === saved.id ? saved : i)),
        ),
    );
  };

  const deleteInventoryItem = async (id: string) => {
    await handleRequest(
      `/api/inventory/items/${id}`,
      { method: "DELETE" },
      "Item removed",
      () => setInventoryItems((prev) => prev.filter((i) => i.id !== id)),
    );
  };

  const addMedicineUsage = async (usage: MedicineUsage) => {
    const { id, ...data } = usage;
    await handleRequest(
      "/api/medicine-usages",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      "Usage recorded",
      (saved) => {
        setMedicineUsage((prev) => [saved, ...prev]);
        // Also update local medicine quantity
        setMedicines((prev) =>
          prev.map((m) =>
            m.id === saved.medicineId
              ? { ...m, quantity: m.quantity - parseFloat(saved.quantity) }
              : m,
          ),
        );
      },
    );
  };

  const deleteMedicineUsage = async (id: string) => {
    await handleRequest(
      `/api/medicine-usages/${id}`,
      { method: "DELETE" },
      "Usage removed",
      () => setMedicineUsage((prev) => prev.filter((m) => m.id !== id)),
    );
  };

  const addStaff = async (member: StaffMember) => {
    const { id, ...data } = member;
    await handleRequest(
      "/api/staff",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      "Staff member added",
      (saved) => setStaff((prev) => [saved, ...prev]),
    );
  };

  const updateStaff = async (member: StaffMember) => {
    await handleRequest(
      `/api/staff/${member.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(member),
      },
      "Staff member updated",
      (saved) =>
        setStaff((prev) => prev.map((s) => (s.id === saved.id ? saved : s))),
    );
  };

  const deleteStaff = async (id: string) => {
    await handleRequest(
      `/api/staff/${id}`,
      { method: "DELETE" },
      "Staff removed",
      () => setStaff((prev) => prev.filter((s) => s.id !== id)),
    );
  };

  return (
    <AppContext.Provider
      value={{
        animals,
        cases,
        clinicalEntries,
        wildlifeCases,
        declarations,
        medicines,
        donations,
        adoptions,
        adoptionApplications,
        abcRecords,
        housekeepingSupplies,
        inventoryItems,
        medicineUsage,
        staff,
        userProfiles,
        lowStockMedicines,
        isLoading,
        addAnimal,
        updateAnimal,
        addCase,
        updateCase,
        addClinicalEntry,
        updateClinicalEntry,
        addWildlifeCase,
        addDeclaration,
        updateDeclaration,
        addMedicine,
        updateMedicineQuantity,
        deleteMedicine,
        deleteDonation,
        deleteAdoption,
        deleteAdoptionApplication,
        deleteABCRecord,
        deleteHousekeepingSupply,
        deleteInventoryItem,
        deleteMedicineUsage,
        deleteStaff,
        deleteAnimal,
        deleteCase,
        deleteClinicalEntry,
        deleteDeclaration,
        addDonation,
        addAdoption,
        addAdoptionApplication,
        updateAdoptionApplication,
        addABCRecord,
        updateABCRecord,
        addHousekeepingSupply,
        updateHousekeepingSupply,
        addInventoryItem,
        updateInventoryItem,
        addMedicineUsage,
        addStaff,
        updateStaff,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
