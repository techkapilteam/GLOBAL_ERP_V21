import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  Module,
  NavigationService,
  SubModule,
  Screen
} from '../../../core/services/Navigation/navigation.service';
import { AuthService } from '../../../core/services/auth.service';

export interface Theme {
  id: string;
  name: string;
  colors: [string, string];
}

export interface RecentForm {
  name: string;
  route: string;
  moduleId: string;
  moduleName: string;
  subModuleId: string;
  subModuleName: string;
  screenId: string;
  icon: string;
  time: Date;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  modules: Module[] = [];
  selectedModule: Module | null = null;
  selectedSubModule: SubModule | null = null;
  selectedScreen: Screen | null = null;

  sidebarCollapsed = true;
  username = '';
  expandedSubModules: Set<string> = new Set<string>();

  showMegaMenu = false;
  showAvatarMenu = false;
  showRecentForms = false;
  showFlyoutSearch = false;
  showThemeDropdown = false;

  flyoutSearchQuery = '';
  megaMenuSearch = '';
  activeTheme = 'sky';

  recentForms: RecentForm[] = [];

  themes: Theme[] = [
    { id: 'sky', name: 'Sky', colors: ['#7fb3ff', '#4d8fff'] },
    { id: 'mist', name: 'Mist', colors: ['#b8d7ff', '#7aaeff'] },
    { id: 'royal', name: 'Royal', colors: ['#6f8cff', '#5175ff'] },
    { id: 'emerald', name: 'Emerald', colors: ['#76d5c7', '#4fb8a8'] },
    { id: 'slate', name: 'Slate', colors: ['#aab8d6', '#7d8fb3'] },
    { id: 'gold', name: 'Gold', colors: ['#f0cf6a', '#c9a227'] },
    { id: 'copper', name: 'Copper', colors: ['#d9996b', '#a85f3a'] },
    { id: 'pink', name: 'Pink', colors: ['#f7a9c4', '#e26aa5'] }
  ];

  constructor(
    private navigationService: NavigationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.modules = this.navigationService.getModules();
    this.username = this.authService.getUsername() || 'User';

    const savedTheme = localStorage.getItem('erp-theme');
    this.setTheme(savedTheme || this.activeTheme);

    this.navigationService.selectedModule$.subscribe((module: Module | null) => {
      this.selectedModule = module;
    });

    this.navigationService.selectedSubModule$.subscribe((subModule: SubModule | null) => {
      this.selectedSubModule = subModule;
    });

    this.navigationService.selectedScreen$.subscribe((screen: Screen | null) => {
      this.selectedScreen = screen;
    });

    // Set General Receipt as default selection
    // this.setDefaultSelection();
  }

  private setDefaultSelection(): void {
    // Find Accounts module
    const accountsModule = this.modules.find(m => m.id === 'accounts');
    if (!accountsModule) return;

    // Find Accounts Transactions sub-module
    const transactionsSubModule = accountsModule.subModules.find(
      s => s.id === 'accounts-transactions'
    );
    if (!transactionsSubModule) return;

    // Find General Receipt screen
    const generalReceiptScreen = transactionsSubModule.screens.find(
      s => s.id === 'general-receipt'
    );
    if (!generalReceiptScreen) return;

    // Select module, sub-module, and screen
    this.navigationService.selectModule(accountsModule);
    this.navigationService.selectSubModule(transactionsSubModule);
    this.navigationService.selectScreen(generalReceiptScreen);

    // Expand the sub-module in the sidebar
    this.expandedSubModules.add(transactionsSubModule.id);

    // Navigate to the General Receipt route
    this.router.navigate([generalReceiptScreen.route]);
  }

  setTheme(themeId: string): void {
    this.activeTheme = themeId;
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('erp-theme', themeId);
  }

  getActiveThemeName(): string {
    return this.themes.find(theme => theme.id === this.activeTheme)?.name || 'Sky';
  }

  selectModule(module: Module): void {
    if (this.selectedModule?.id === module.id) {
      this.toggleSidebar();
      return;
    }

    this.selectedSubModule = null;
    this.selectedScreen = null;
    this.expandedSubModules.clear();
    this.closeFlyoutSearch();

    this.navigationService.selectModule(module);
    this.sidebarCollapsed = false;
  }

  toggleSubModule(subModule: SubModule): void {
    if (this.sidebarCollapsed) {
      this.sidebarCollapsed = false;
    }

    if (this.expandedSubModules.has(subModule.id)) {
      this.expandedSubModules.delete(subModule.id);

      if (this.selectedSubModule?.id === subModule.id) {
        this.selectedSubModule = null;
      }

      this.closeFlyoutSearch();
      return;
    }

    this.expandedSubModules.clear();
    this.expandedSubModules.add(subModule.id);
    this.navigationService.selectSubModule(subModule);
    this.closeFlyoutSearch();
  }

  isSubModuleExpanded(subModuleId: string): boolean {
    return this.expandedSubModules.has(subModuleId);
  }

  selectScreen(screen: Screen): void {
    this.navigationService.selectScreen(screen);
    this.router.navigate([screen.route]);
    this.addToRecent(screen);
    this.showMegaMenu = false;
    this.showRecentForms = false;
    this.closeFlyoutSearch();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;

    if (this.sidebarCollapsed) {
      this.expandedSubModules.clear();
      this.closeFlyoutSearch();
    } else if (!this.selectedModule && this.modules.length > 0) {
      this.navigationService.selectModule(this.modules[0]);
    }
  }

  closeFlyout(): void {
    this.expandedSubModules.clear();
    this.selectedSubModule = null;
    this.closeFlyoutSearch();
  }

  toggleFlyoutSearch(): void {
    this.showFlyoutSearch = !this.showFlyoutSearch;

    if (!this.showFlyoutSearch) {
      this.flyoutSearchQuery = '';
    }
  }

  closeFlyoutSearch(): void {
    this.showFlyoutSearch = false;
    this.flyoutSearchQuery = '';
  }

  toggleThemeDropdown(): void {
    this.showThemeDropdown = !this.showThemeDropdown;
  }

  get filteredFlyoutScreens(): Screen[] {
    const screens = this.selectedSubModule?.screens || [];
    const q = this.flyoutSearchQuery.trim().toLowerCase();

    if (!q) {
      return screens;
    }

    return screens.filter(screen => screen.name.toLowerCase().includes(q));
  }

  get filteredMegaModules(): Module[] {
    if (!this.megaMenuSearch.trim()) {
      return this.modules;
    }

    const q = this.megaMenuSearch.toLowerCase();

    return this.modules
      .map((mod: Module) => ({
        ...mod,
        subModules: mod.subModules
          .map((sub: SubModule) => ({
            ...sub,
            screens: (sub.screens || []).filter((sc: Screen) =>
              sc.name.toLowerCase().includes(q) ||
              sub.name.toLowerCase().includes(q) ||
              mod.name.toLowerCase().includes(q)
            )
          }))
          .filter((sub: SubModule) =>
            sub.screens.length > 0 ||
            sub.name.toLowerCase().includes(q) ||
            mod.name.toLowerCase().includes(q)
          )
      }))
      .filter((mod: Module) =>
        mod.subModules.length > 0 || mod.name.toLowerCase().includes(q)
      );
  }

  navigateFromMega(mod: Module, sub: SubModule, screen: Screen): void {
    this.navigationService.selectModule(mod);
    this.sidebarCollapsed = false;
    this.expandedSubModules.clear();
    this.expandedSubModules.add(sub.id);
    this.navigationService.selectSubModule(sub);
    this.selectScreen(screen);
    this.showMegaMenu = false;
  }

  addToRecent(screen: Screen): void {
    const existingIndex = this.recentForms.findIndex(item => item.route === screen.route);

    if (existingIndex > -1) {
      this.recentForms.splice(existingIndex, 1);
    }

    this.recentForms.unshift({
      name: screen.name,
      route: screen.route,
      moduleId: this.selectedModule?.id || '',
      moduleName: this.selectedModule?.name || '',
      subModuleId: this.selectedSubModule?.id || '',
      subModuleName: this.selectedSubModule?.name || '',
      screenId: screen.id,
      icon: this.getScreenIcon(screen.name),
      time: new Date()
    });

    if (this.recentForms.length > 8) {
      this.recentForms.pop();
    }
  }

  navigateRecent(form: RecentForm): void {
    const module =
      this.modules.find(item => item.id === form.moduleId) ||
      this.modules.find(item => item.name === form.moduleName);

    if (module) {
      this.navigationService.selectModule(module);
      this.sidebarCollapsed = false;

      const subModule =
        module.subModules.find(item => item.id === form.subModuleId) ||
        module.subModules.find(item => item.name === form.subModuleName);

      if (subModule) {
        this.expandedSubModules.clear();
        this.expandedSubModules.add(subModule.id);
        this.navigationService.selectSubModule(subModule);

        const screen =
          subModule.screens.find(item => item.id === form.screenId) ||
          subModule.screens.find(item => item.route === form.route);

        if (screen) {
          this.navigationService.selectScreen(screen);
        }
      }
    }

    this.router.navigate([form.route]);
    this.showRecentForms = false;
  }

  clearRecent(): void {
    this.recentForms = [];
  }

  getRecentTimeLabel(date: Date): string {
    const diffMinutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  }

  closeAllPanels(): void {
    this.showMegaMenu = false;
    this.showAvatarMenu = false;
    this.showRecentForms = false;
    this.showThemeDropdown = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAllPanels();
    this.closeFlyoutSearch();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getModuleIcon(name?: string): string {
    const value = (name || '').toLowerCase();

    if (value.includes('account')) return 'pi pi-briefcase';
    if (value.includes('inventory')) return 'pi pi-box';
    if (value.includes('hr')) return 'pi pi-users';
    if (value.includes('setting')) return 'pi pi-cog';
    if (value.includes('payroll')) return 'pi pi-wallet';
    if (value.includes('report')) return 'pi pi-chart-bar';
    if (value.includes('admin')) return 'pi pi-shield';

    return 'pi pi-th-large';
  }

  getSubModuleIcon(name?: string): string {
    const value = (name || '').toLowerCase();

    if (value.includes('deposit')) return 'pi pi-folder-open';
    if (value.includes('withdraw')) return 'pi pi-folder-open';
    if (value.includes('transfer')) return 'pi pi-arrow-right-arrow-left';
    if (value.includes('report')) return 'pi pi-chart-line';
    if (value.includes('payroll')) return 'pi pi-wallet';
    if (value.includes('customer')) return 'pi pi-users';
    if (value.includes('employee')) return 'pi pi-id-card';
    if (value.includes('leave')) return 'pi pi-calendar';
    if (value.includes('setting')) return 'pi pi-sliders-h';
    if (value.includes('master')) return 'pi pi-database';
    if (value.includes('verification')) return 'pi pi-check-square';

    return 'pi pi-folder';
  }

  getScreenIcon(name?: string): string {
    const value = (name || '').toLowerCase();

    if (value.includes('salary')) return 'pi pi-wallet';
    if (value.includes('esi')) return 'pi pi-shield';
    if (value.includes('pf')) return 'pi pi-building-columns';
    if (value.includes('tax')) return 'pi pi-percentage';
    if (value.includes('bonus')) return 'pi pi-gift';
    if (value.includes('leave')) return 'pi pi-calendar';
    if (value.includes('loyalty')) return 'pi pi-star';
    if (value.includes('payslip')) return 'pi pi-file';
    if (value.includes('statement')) return 'pi pi-file-edit';
    if (value.includes('attendance')) return 'pi pi-clock';
    if (value.includes('withdrawal')) return 'pi pi-angle-right';
    if (value.includes('transfer')) return 'pi pi-angle-right';
    if (value.includes('cheque')) return 'pi pi-angle-right';
    if (value.includes('receipt')) return 'pi pi-angle-right';
    if (value.includes('voucher')) return 'pi pi-angle-right';

    return 'pi pi-angle-right';
  }
}